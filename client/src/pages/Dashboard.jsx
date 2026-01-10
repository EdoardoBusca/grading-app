// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';

// Notice we accept "projects" as a prop now
const Dashboard = ({ projects }) => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎓 Student Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Projects to Grade */}
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#d32f2f' }}>👨‍⚖️ Projects to Grade</h2>
          {projects.filter(p => p.myRole === 'JURY').map(p => (
            <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', background: 'white' }}>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <Link to={`/project/${p.id}`}>
                <button style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                  Grade Now
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Right Column: My Projects */}
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#1976d2' }}>📂 My Projects</h2>
            <Link to="/add-project">
              <button style={{ background: '#1976d2', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
                + Add New
              </button>
            </Link>
          </div>

          {projects.filter(p => p.myRole === 'OWNER').map(p => (
            <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', background: 'white' }}>
              <h3>{p.title} (You)</h3>
              <p>{p.description}</p>
              <button>Edit Project</button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;