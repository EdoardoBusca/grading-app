// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AddProject from './pages/AddProject';
import { MOCK_PROJECTS } from './services/mockData';

function App() {
  // 1. Initialize State with the Mock Data
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  // 2. Create a function to add a new project
  const handleAddProject = (newProject) => {
    const projectWithId = { ...newProject, id: Date.now(), myRole: 'OWNER' };
    setProjects([...projects, projectWithId]);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* PASS THE DATA DOWN TO THE PAGES */}
        <Route path="/dashboard" element={<Dashboard projects={projects} />} />
        <Route path="/project/:id" element={<ProjectDetails projects={projects} />} />
        <Route path="/add-project" element={<AddProject onAdd={handleAddProject} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;