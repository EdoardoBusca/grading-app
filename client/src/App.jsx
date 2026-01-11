// src/App.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AddProject from './pages/AddProject';
import ProfessorView from './pages/ProfessorView';
import {
  seedInitialState,
  persist,
  setCurrentUser,
  addProject,
  addDeliverable,
  addMedia,
  selectJury,
  submitGrade,
  modifyGrade,
  getCurrentUser,
} from './services/store';

export const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = useState(seedInitialState());

  useEffect(() => { persist(state); }, [state]);

  const actions = {
    setCurrentUser: (userId) => setState(s => setCurrentUser(s, userId)),
    addProject: (payload) => setState(s => addProject(s, payload)),
    addDeliverable: (projectId, payload) => setState(s => addDeliverable(s, projectId, payload)),
    addMedia: (deliverableId, payload) => setState(s => addMedia(s, deliverableId, payload)),
    selectJury: (deliverableId, count) => setState(s => selectJury(s, deliverableId, count)),
    submitGrade: (deliverableId, value) => setState(s => submitGrade(s, deliverableId, s.currentUserId, value)),
    modifyGrade: (gradeId, value) => setState(s => modifyGrade(s, gradeId, s.currentUserId, value)),
  };

  const value = { state, actions };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function UserSwitcher() {
  const { state, actions } = useContext(StoreContext);
  const user = getCurrentUser(state);
  return (
    <div style={{ padding: '0.75rem 1rem', background: '#f4f6f8', borderBottom: '1px solid #ddd', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span>Signed in as: <strong>{user?.name}</strong> ({user?.role})</span>
      <select value={state.currentUserId} onChange={(e) => actions.setCurrentUser(parseInt(e.target.value, 10))}>
        {state.users.map(u => (
          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
        ))}
      </select>
      <span style={{ marginLeft: 'auto' }}>
        <Link to="/dashboard">Dashboard</Link> |{' '}
        <Link to="/add-project">Add Project</Link> |{' '}
        <Link to="/professor">Professor View</Link>
      </span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <UserSwitcher />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/professor" element={<ProfessorView />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;