// src/pages/AddProject.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../App';
import { getCurrentUser } from '../services/store';

const AddProject = () => {
  const { state, actions } = useContext(StoreContext);
  const user = getCurrentUser(state);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });

  if (user?.role === 'professor') {
    return <div style={{padding: 20}}>Professors cannot add projects.</div>;
  }

  if (user?.role === 'jury') {
    return <div style={{padding: 20}}>Jury members cannot add projects. Only students can create projects.</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    actions.addProject({ title: formData.title, description: formData.description });
    alert("Project Added!");
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', borderRadius: '12px', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <Link to="/dashboard" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '500', marginBottom: '1rem', display: 'inline-block', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#1565c0'} onMouseLeave={(e) => e.target.style.color = '#1976d2'}>← Back to Dashboard</Link>
      <h1 style={{ color: '#333', fontSize: '28px', fontWeight: '700', margin: '0 0 1.5rem 0' }}>📂 Add New Project</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#555', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>Project Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Mobile App Redesign" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#555', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Describe your project goals and outcomes..." style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical', transition: 'all 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#555', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>URL (Optional)</label>
          <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }} />
        </div>
        <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s', marginTop: '8px' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#1565c0'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(25,118,210,0.3)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#1976d2'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>🚀 Submit Project</button>
      </form>
    </div>
  );
};

export default AddProject;