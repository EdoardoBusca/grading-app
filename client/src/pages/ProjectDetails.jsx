// src/pages/ProjectDetails.jsx
import { useParams, Link } from 'react-router-dom';

// Accept "projects" as a prop
const ProjectDetails = ({ projects }) => {
  const { id } = useParams();
  
  // Find the project in the LIVE list
  const project = projects.find(p => p.id === parseInt(id));

  if (!project) return <div style={{padding: 20}}>Project not found (ID: {id})</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>Grade Project: {project.title}</h1>
      <p><strong>Description:</strong> {project.description}</p>
      
      <div style={{ border: '2px solid #d32f2f', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h3>Your Anonymous Vote</h3>
        <p>Give a grade from 1 to 10.</p>
        <input type="number" min="1" max="10" placeholder="10" style={{ padding: '10px', width: '60px' }} />
        <br /><br />
        <button onClick={() => alert("Vote Submitted!")} style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
          Submit Grade
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;