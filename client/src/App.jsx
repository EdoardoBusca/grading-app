// src/App.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AddProject from './pages/AddProject';
import ProfessorView from './pages/ProfessorView';
import Login from './pages/Login';
import {
  seedInitialState,
  persist,
  setCurrentUser,
  addProject,
  addURL,
  selectJury,
  submitGrade,
  modifyGrade,
  getCurrentUser,
} from './services/store';

export const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = useState(seedInitialState());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { persist(state); }, [state]);

  const actions = {
    setCurrentUser: (userId) => { setState(s => setCurrentUser(s, userId)); setIsAuthenticated(true); },
    logout: () => setIsAuthenticated(false),
    addProject: (payload) => setState(s => addProject(s, payload)),
    addURL: (projectId, url) => setState(s => addURL(s, projectId, url)),
    selectJury: (projectId, count) => setState(s => selectJury(s, projectId, count)),
    submitGrade: (projectId, value) => setState(s => submitGrade(s, projectId, s.currentUserId, value)),
    modifyGrade: (gradeId, value) => setState(s => modifyGrade(s, gradeId, s.currentUserId, value)),
  };

  const value = { state, actions, isAuthenticated };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function UserSwitcher() {
  const { state, actions } = useContext(StoreContext);
  const user = getCurrentUser(state);
  return (
    <div style={{ padding: '1.2rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderBottom: '3px solid #667eea', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ color: 'white' }}>
        <span style={{ fontSize: '12px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Signed in as</span>
        <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '2px' }}>{user?.name}</div>
        <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'capitalize' }}>({user?.role})</span>
      </div>
      <select value={state.currentUserId} onChange={(e) => actions.setCurrentUser(parseInt(e.target.value, 10))} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'white', color: '#667eea', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onMouseEnter={(e) => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; e.target.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; e.target.style.transform = 'translateY(0)'; }}>
        {state.users.map(u => (
          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
        ))}
      </select>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: '24px' }}>
        <Link to="/client/add-project" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s', paddingBottom: '4px', borderBottom: '2px solid transparent' }} onMouseEnter={(e) => { e.target.style.opacity = '0.8'; e.target.style.borderBottomColor = 'white'; }} onMouseLeave={(e) => { e.target.style.opacity = '1'; e.target.style.borderBottomColor = 'transparent'; }}>+ Add Project</Link>
        <Link to="/client/professor" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s', paddingBottom: '4px', borderBottom: '2px solid transparent' }} onMouseEnter={(e) => { e.target.style.opacity = '0.8'; e.target.style.borderBottomColor = 'white'; }} onMouseLeave={(e) => { e.target.style.opacity = '1'; e.target.style.borderBottomColor = 'transparent'; }}>📊 Results</Link>
        <Link to="/client/login" onClick={() => actions.logout()} style={{ color: 'white', textDecoration: 'none', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s', paddingBottom: '4px', borderBottom: '2px solid transparent' }} onMouseEnter={(e) => { e.target.style.opacity = '0.8'; e.target.style.borderBottomColor = 'white'; }} onMouseLeave={(e) => { e.target.style.opacity = '1'; e.target.style.borderBottomColor = 'transparent'; }}>🚪 Logout</Link>
      </span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(StoreContext);
  return isAuthenticated ? children : <Navigate to="/client/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/client/login" replace />} />
          <Route path="/client/login" element={<Login />} />
          <Route path="/client/dashboard" element={<ProtectedRoute><UserSwitcher /><Dashboard /></ProtectedRoute>} />
          <Route path="/client/project/:id" element={<ProtectedRoute><UserSwitcher /><ProjectDetails /></ProtectedRoute>} />
          <Route path="/client/add-project" element={<ProtectedRoute><UserSwitcher /><AddProject /></ProtectedRoute>} />
          <Route path="/client/professor" element={<ProtectedRoute><UserSwitcher /><ProfessorView /></ProtectedRoute>} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;