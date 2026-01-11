// src/services/store.js
// Front-end only store helpers: pure functions operating on state

export const GRADE_MODIFY_WINDOW_MINUTES = 1440; // 24 hours

export function seedInitialState() {
  const saved = localStorage.getItem('grading-app-state');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  const users = [
    { id: 1, name: 'Alice', role: 'student', eligibleEvaluator: false },
    { id: 2, name: 'Bob', role: 'student', eligibleEvaluator: false },
    { id: 3, name: 'Charlie', role: 'student', eligibleEvaluator: false },
    { id: 4, name: 'Dana', role: 'student', eligibleEvaluator: false },
    { id: 5, name: 'Eve', role: 'student', eligibleEvaluator: false },
    { id: 6, name: 'Frank', role: 'student', eligibleEvaluator: false },
    { id: 7, name: 'Grace', role: 'student', eligibleEvaluator: false },
    { id: 10, name: 'Jury1', role: 'jury', eligibleEvaluator: true },
    { id: 11, name: 'Jury2', role: 'jury', eligibleEvaluator: true },
    { id: 12, name: 'Jury3', role: 'jury', eligibleEvaluator: true },
  ];
  return {
    users,
    currentUserId: 1,
    projects: [],
    grades: [],
    nextIds: { project: 1, grade: 1 },
  };
}

export function persist(state) {
  localStorage.setItem('grading-app-state', JSON.stringify(state));
}

export function setCurrentUser(state, userId) {
  return { ...state, currentUserId: userId };
}

export function addProject(state, { title, description }) {
  const id = state.nextIds.project++;
  const ownerId = state.currentUserId;
  
  // Automatically select all 3 jury members
  const eligible = state.users.filter(u => u.role === 'jury' && u.eligibleEvaluator);
  const juryUserIds = eligible.map(u => u.id);
  const nowIso = new Date().toISOString();
  
  const project = {
    id,
    title,
    description: description || '',
    url: '',
    ownerId,
    members: [{ userId: ownerId, role: 'PM' }],
    juryUserIds,
    gradeIds: [],
    jurySelectedAt: nowIso,
  };
  const projects = [...state.projects, project];
  return { ...state, projects, nextIds: { ...state.nextIds } };
}

export function addURL(state, projectId, url) {
  const projects = state.projects.map(p => p.id === projectId ? { ...p, url } : p);
  return { ...state, projects };
}

export function isProjectPM(state, project, userId) {
  return project.ownerId === userId || (project.members || []).some(m => m.userId === userId && m.role === 'PM');
}

export function selectJury(state, projectId, count = 3) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return state;
  const eligible = state.users.filter(u => u.role === 'jury' && u.eligibleEvaluator);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length)).map(u => u.id);
  const nowIso = new Date().toISOString();
  const projects = state.projects.map(p => p.id === projectId ? { ...p, juryUserIds: selected, jurySelectedAt: nowIso } : p);
  return { ...state, projects };
}

export function clampGrade(value) {
  const v = Math.max(1, Math.min(10, Number(value)));
  return Math.round(v * 100) / 100;
}

export function submitGrade(state, projectId, graderId, value) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return state;
  if (!project.juryUserIds.includes(graderId)) return state; // permission: only jury
  const existing = state.grades.find(g => g.projectId === projectId && g.graderId === graderId);
  if (existing) return state; // cannot re-submit; use modify
  const id = state.nextIds.grade++;
  const clamped = clampGrade(value);
  const nowIso = new Date().toISOString();
  const grade = { id, projectId, graderId, value: clamped, submittedAt: nowIso, modifiedAt: null };
  const grades = [...state.grades, grade];
  const projects = state.projects.map(p => p.id === projectId ? { ...p, gradeIds: [...(p.gradeIds || []), id] } : p);
  return { ...state, grades, projects, nextIds: { ...state.nextIds } };
}

export function modifyGrade(state, gradeId, graderId, value) {
  const grade = state.grades.find(g => g.id === gradeId);
  if (!grade) return state;
  if (grade.graderId !== graderId) return state; // permission: only own grade
  const submittedAt = new Date(grade.submittedAt);
  const now = new Date();
  const minutes = (now - submittedAt) / (1000 * 60);
  if (minutes > GRADE_MODIFY_WINDOW_MINUTES) return state; // window expired
  const clamped = clampGrade(value);
  const grades = state.grades.map(g => g.id === gradeId ? { ...g, value: clamped, modifiedAt: now.toISOString() } : g);
  return { ...state, grades };
}

export function deliverableGrades(state, projectId) {
  return state.grades.filter(g => g.projectId === projectId);
}

export function computeSummary(values) {
  if (!values || values.length === 0) return { count: 0, average: null, min: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  let core = sorted.slice(1, sorted.length - 1);
  if (core.length === 0) core = sorted;
  const avg = core.reduce((s, v) => s + v, 0) / core.length;
  return { count: sorted.length, average: Math.round(avg * 100) / 100, min, max };
}

export function projectEvaluation(state, projectId) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return null;
  const vals = deliverableGrades(state, projectId).map(g => g.value);
  const summary = computeSummary(vals);
  return {
    projectId: project.id,
    title: project.title,
    url: project.url,
    summary,
  };
}

export function isJuryForProject(state, projectId, userId) {
  const p = state.projects.find(x => x.id === projectId);
  return !!(p && p.juryUserIds && p.juryUserIds.includes(userId));
}

export function getCurrentUser(state) {
  return state.users.find(u => u.id === state.currentUserId);
}

export function getProjectsForPM(state, userId) {
  return state.projects.filter(p => isProjectPM(state, p, userId));
}

export function getProjectsForJury(state, userId) {
  return state.projects.filter(p => p.juryUserIds && p.juryUserIds.includes(userId));
}

export function getMyJuryGrades(state, userId) {
  const items = [];
  for (const p of state.projects) {
    if (!p.juryUserIds.includes(userId)) continue;
    const myGrade = state.grades.find(g => g.projectId === p.id && g.graderId === userId) || null;
    const canModify = !!(myGrade && ((new Date() - new Date(myGrade.submittedAt)) / (1000 * 60)) <= GRADE_MODIFY_WINDOW_MINUTES);
    items.push({
      projectId: p.id,
      title: p.title,
      myGrade,
      canModify,
      gradeId: myGrade?.id || null,
    });
  }
  return items;
}

export function getProjectJuryStatus(state, projectId, userId) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project || !project.juryUserIds.includes(userId)) return null;
  const myGrade = state.grades.find(g => g.projectId === projectId && g.graderId === userId);
  return {
    hasGraded: !!myGrade,
    grade: myGrade?.value || null,
  };
}
