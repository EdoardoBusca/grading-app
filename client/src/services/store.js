// src/services/store.js
// Front-end only store helpers: pure functions operating on state

export const GRADE_MODIFY_WINDOW_MINUTES = 1440; // 24 hours

export function seedInitialState() {
  const saved = localStorage.getItem('grading-app-state');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  const users = [
    { id: 1, name: 'Alice', role: 'student', eligibleEvaluator: true },
    { id: 2, name: 'Bob', role: 'student', eligibleEvaluator: true },
    { id: 3, name: 'Charlie', role: 'student', eligibleEvaluator: true },
    { id: 4, name: 'Dana', role: 'student', eligibleEvaluator: true },
    { id: 100, name: 'Prof. Smith', role: 'professor', eligibleEvaluator: false },
  ];
  return {
    users,
    currentUserId: 1,
    projects: [],
    deliverables: [],
    grades: [],
    juries: [],
    nextIds: { project: 1, deliverable: 1, grade: 1, jury: 1 },
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
  const project = {
    id,
    title,
    description: description || '',
    ownerId,
    members: [{ userId: ownerId, role: 'PM' }],
    deliverableIds: [],
  };
  const projects = [...state.projects, project];
  return { ...state, projects, nextIds: { ...state.nextIds } };
}

export function addDeliverable(state, projectId, { title, dueDate }) {
  const id = state.nextIds.deliverable++;
  const deliverable = { id, projectId, title, dueDate, media: {}, juryUserIds: [], gradeIds: [], jurySelectedAt: null };
  const deliverables = [...state.deliverables, deliverable];
  const projects = state.projects.map(p => p.id === projectId ? { ...p, deliverableIds: [...(p.deliverableIds || []), id] } : p);
  return { ...state, deliverables, projects, nextIds: { ...state.nextIds } };
}

export function addMedia(state, deliverableId, { videoUrl, demoUrl }) {
  const deliverables = state.deliverables.map(d => d.id === deliverableId ? { ...d, media: { videoUrl: videoUrl || d.media.videoUrl, demoUrl: demoUrl || d.media.demoUrl } } : d);
  return { ...state, deliverables };
}

export function isProjectPM(state, project, userId) {
  return project.ownerId === userId || (project.members || []).some(m => m.userId === userId && m.role === 'PM');
}

export function selectJury(state, deliverableId, count = 3) {
  const deliverable = state.deliverables.find(d => d.id === deliverableId);
  if (!deliverable) return state;
  const project = state.projects.find(p => p.id === deliverable.projectId);
  const projectPMIds = project.members.filter(m => m.role === 'PM').map(m => m.userId);
  const eligible = state.users.filter(u => u.role === 'student' && u.eligibleEvaluator && !projectPMIds.includes(u.id));
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length)).map(u => u.id);
  const nowIso = new Date().toISOString();
  const deliverables = state.deliverables.map(d => d.id === deliverableId ? { ...d, juryUserIds: selected, jurySelectedAt: nowIso } : d);
  const juryId = state.nextIds.jury++;
  const juries = [...state.juries, { id: juryId, deliverableId, userIds: selected, createdAt: nowIso }];
  return { ...state, deliverables, juries, nextIds: { ...state.nextIds } };
}

export function clampGrade(value) {
  const v = Math.max(1, Math.min(10, Number(value)));
  return Math.round(v * 100) / 100;
}

export function submitGrade(state, deliverableId, graderId, value) {
  const deliverable = state.deliverables.find(d => d.id === deliverableId);
  if (!deliverable) return state;
  if (!deliverable.juryUserIds.includes(graderId)) return state; // permission: only jury
  const existing = state.grades.find(g => g.deliverableId === deliverableId && g.graderId === graderId);
  if (existing) return state; // cannot re-submit; use modify
  const id = state.nextIds.grade++;
  const clamped = clampGrade(value);
  const nowIso = new Date().toISOString();
  const grade = { id, deliverableId, graderId, value: clamped, submittedAt: nowIso, modifiedAt: null };
  const grades = [...state.grades, grade];
  const deliverables = state.deliverables.map(d => d.id === deliverableId ? { ...d, gradeIds: [...(d.gradeIds || []), id] } : d);
  return { ...state, grades, deliverables, nextIds: { ...state.nextIds } };
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

export function deliverableGrades(state, deliverableId) {
  return state.grades.filter(g => g.deliverableId === deliverableId);
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
  const items = (project.deliverableIds || []).map(did => {
    const d = state.deliverables.find(x => x.id === did);
    const vals = deliverableGrades(state, did).map(g => g.value);
    return {
      deliverableId: did,
      title: d?.title,
      dueDate: d?.dueDate,
      media: d?.media || {},
      summary: computeSummary(vals),
    };
  });
  return { projectId: project.id, title: project.title, evaluations: items };
}

export function isJuryForDeliverable(state, deliverableId, userId) {
  const d = state.deliverables.find(x => x.id === deliverableId);
  return !!(d && d.juryUserIds && d.juryUserIds.includes(userId));
}

export function getCurrentUser(state) {
  return state.users.find(u => u.id === state.currentUserId);
}

export function getProjectsForPM(state, userId) {
  return state.projects.filter(p => isProjectPM(state, p, userId));
}

export function getProjectsForJury(state, userId) {
  const juryDeliverableProjectIds = new Set(
    state.deliverables.filter(d => d.juryUserIds.includes(userId)).map(d => d.projectId)
  );
  return state.projects.filter(p => juryDeliverableProjectIds.has(p.id));
}

export function getMyJuryGrades(state, userId) {
  const items = [];
  for (const d of state.deliverables) {
    if (!d.juryUserIds.includes(userId)) continue;
    const p = state.projects.find(x => x.id === d.projectId);
    const myGrade = state.grades.find(g => g.deliverableId === d.id && g.graderId === userId) || null;
    const canModify = !!(myGrade && ((new Date() - new Date(myGrade.submittedAt)) / (1000 * 60)) <= GRADE_MODIFY_WINDOW_MINUTES);
    items.push({
      deliverableId: d.id,
      title: d.title,
      projectId: p?.id,
      projectTitle: p?.title,
      myGrade,
      canModify,
      gradeId: myGrade?.id || null,
    });
  }
  return items;
}

export function getProjectJuryStatus(state, projectId, userId) {
  const deliverables = state.deliverables.filter(d => d.projectId === projectId && d.juryUserIds.includes(userId));
  if (deliverables.length === 0) return null;
  const graded = deliverables.filter(d => state.grades.some(g => g.deliverableId === d.id && g.graderId === userId));
  return {
    total: deliverables.length,
    graded: graded.length,
    pending: deliverables.length - graded.length,
  };
}
