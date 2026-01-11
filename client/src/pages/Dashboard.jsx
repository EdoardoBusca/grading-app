// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { StoreContext } from '../App';
import { getProjectsForPM, getProjectsForJury, getMyJuryGrades, getProjectJuryStatus } from '../services/store';

const Dashboard = () => {
  const { state, actions } = useContext(StoreContext);
  const myProjects = getProjectsForPM(state, state.currentUserId);
  const juryProjects = getProjectsForJury(state, state.currentUserId);
  const myGrades = getMyJuryGrades(state, state.currentUserId);
  const [gradeInputs, setGradeInputs] = useState({});
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎓 Student Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#d32f2f' }}>👨‍⚖️ Projects to Grade</h2>
          {juryProjects.map(p => {
            const status = getProjectJuryStatus(state, p.id, state.currentUserId);
            return (
              <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', background: 'white' }}>
                <h3>
                  {p.title}
                  {status && status.pending > 0 ? (
                    <span style={{ marginLeft: 8, color: '#d32f2f', fontWeight: 'bold' }}>⏳ {status.graded}/{status.total}</span>
                  ) : (
                    <span style={{ marginLeft: 8, color: '#28a745', fontWeight: 'bold' }}>✓ Complete</span>
                  )}
                </h3>
                <p>{p.description}</p>
                <Link to={`/project/${p.id}`}>
                  <button style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                    Grade Now
                  </button>
                </Link>
              </div>
            );
          })}
          {juryProjects.length === 0 && <em>No assigned juries yet.</em>}
        </div>

        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#1976d2' }}>📂 My Projects</h2>
            <Link to="/add-project">
              <button style={{ background: '#1976d2', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
                + Add New
              </button>
            </Link>
          </div>
          {myProjects.map(p => (
            <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', background: 'white' }}>
              <h3>{p.title} (You)</h3>
              <p>{p.description}</p>
              <Link to={`/project/${p.id}`}>
                <button style={{ background: '#1976d2', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                  Open
                </button>
              </Link>
            </div>
          ))}
          {myProjects.length === 0 && <em>You have no projects yet.</em>}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ background: '#fffbe6', padding: '16px', borderRadius: 8, border: '1px solid #ffe58f' }}>
          <h2>📝 My Grades (Jury)</h2>
          {myGrades.length === 0 && <em>You are not assigned to any juries yet.</em>}
          {myGrades.map(item => (
            <div key={`${item.projectId}-${item.deliverableId}`} style={{ borderTop: '1px dashed #ddd', paddingTop: 8, marginTop: 8 }}>
              <strong>{item.title}</strong> <em>in {item.projectTitle}</em>
              {item.myGrade ? (
                <div style={{ marginTop: 6 }}>
                  Your grade: <strong>{item.myGrade.value}</strong>
                  {item.canModify ? (
                    <span style={{ marginLeft: 8 }}>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        step={0.01}
                        placeholder="Modify"
                        value={gradeInputs[item.gradeId] ?? ''}
                        onChange={(e)=>setGradeInputs({ ...gradeInputs, [item.gradeId]: e.target.value })}
                        style={{ padding: 6, width: 110 }}
                      />
                      <button
                        style={{ marginLeft: 6, padding: '6px 10px' }}
                        onClick={() => { actions.modifyGrade(item.gradeId, Number(gradeInputs[item.gradeId])); alert('Grade modified'); }}
                      >Save</button>
                    </span>
                  ) : (
                    <em style={{ marginLeft: 8 }}>(modification window expired)</em>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 6 }}>
                  You haven't graded this deliverable yet. Open the project to submit your grade.
                  <Link to={`/project/${item.projectId}`} style={{ marginLeft: 8 }}>Open</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;