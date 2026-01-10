// src/pages/AddProject.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Accept the "onAdd" function
const AddProject = ({ onAdd }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // CALL THE FUNCTION FROM APP.JSX
    onAdd(formData);
    
    alert("Project Added!");
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>📂 Add New Project</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Project Title" style={{ padding: '8px' }} />
        <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Description" style={{ padding: '8px' }} />
        <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="Video URL" style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>🚀 Submit Project</button>
      </form>
    </div>
  );
};

export default AddProject;