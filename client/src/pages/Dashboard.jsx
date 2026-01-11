// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { StoreContext } from '../App';
import { getProjectsForPM, getProjectsForJury, getMyJuryGrades, getCurrentUser } from '../services/store';

const Dashboard = () => {
  const { state, actions } = useContext(StoreContext);
  const user = getCurrentUser(state);
  const myProjects = getProjectsForPM(state, state.currentUserId);
  const juryProjects = getProjectsForJury(state, state.currentUserId);
  const myGrades = getMyJuryGrades(state, state.currentUserId);
  const [gradeInputs, setGradeInputs] = useState({});
  
  const isJury = user?.role === 'jury';
  const isStudent = user?.role === 'student';
  
  return (
    <div style={{ padding: '2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#f5f7fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem', fontSize: '32px', fontWeight: '700' }}>{isJury ? '⚖️ Jury Dashboard' : '🎓 Student Dashboard'}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: isJury ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {isJury && <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>👨‍⚖️ Projects to Grade</h2>
          {juryProjects.length === 0 && <em style={{ color: '#999' }}>No assigned juries yet.</em>}
          {juryProjects.map(p => (
            <div key={p.id} style={{ border: 'none', padding: '12px', margin: '8px 0', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #d32f2f', transition: 'all 0.2s' }}>
              <h3 style={{ margin: '0 0 6px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>{p.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>{p.description}</p>
              <Link to={`/project/${p.id}`}>
                <button style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseEnter={(e)=>{e.target.style.background='#b71c1c'; e.target.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.target.style.background='#d32f2f'; e.target.style.transform='translateY(0)'}}>
                  Grade Now
                </button>
              </Link>
            </div>
          ))}
        </div>}

        {isStudent && <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#1976d2', margin: 0, fontSize: '20px', fontWeight: '600' }}>📂 My Projects</h2>
            <Link to="/add-project">
              <button style={{ background: '#1976d2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseEnter={(e)=>{e.target.style.background='#1565c0'; e.target.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.target.style.background='#1976d2'; e.target.style.transform='translateY(0)'}}>
                + Add New
              </button>
            </Link>
          </div>
          {myProjects.length === 0 && <em style={{ color: '#999' }}>You have no projects yet.</em>}
          {myProjects.map(p => (
            <div key={p.id} style={{ border: 'none', padding: '12px', margin: '8px 0', background: '#f0f7ff', borderRadius: '8px', borderLeft: '4px solid #1976d2', transition: 'all 0.2s' }}>
              <h3 style={{ margin: '0 0 6px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>{p.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>{p.description}</p>
              <Link to={`/project/${p.id}`}>
                <button style={{ background: '#1976d2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseEnter={(e)=>{e.target.style.background='#1565c0'; e.target.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.target.style.background='#1976d2'; e.target.style.transform='translateY(0)'}}>
                  Open
                </button>
              </Link>
            </div>
          ))}
        </div>}
      </div>
      {isJury && <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color: '#f57c00', margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>📝 My Grades (Jury)</h2>
        {myGrades.length === 0 && <em style={{ color: '#999' }}>You are not assigned to any juries yet.</em>}
        {myGrades.map(item => (
          <div key={item.projectId} style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 12 }}>
            <strong style={{ color: '#333', fontSize: '14px' }}>{item.title}</strong>
            {item.myGrade ? (
              <div style={{ marginTop: 8 }}>
                Your grade: <strong style={{ color: '#f57c00', fontSize: '16px' }}>{item.myGrade.value}</strong>
                {item.canModify ? (
                  <span style={{ marginLeft: 12, display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.01}
                      placeholder="Modify"
                      value={gradeInputs[item.gradeId] ?? ''}
                      onChange={(e)=>setGradeInputs({ ...gradeInputs, [item.gradeId]: e.target.value })}
                      style={{ padding: 6, width: 100, borderRadius: 6, border: '1px solid #ddd' }}
                    />
                    <button
                      style={{ padding: '6px 12px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                      onMouseEnter={(e)=>{e.target.style.background='#45a049'; e.target.style.transform='translateY(-2px)'}}
                      onMouseLeave={(e)=>{e.target.style.background='#4caf50'; e.target.style.transform='translateY(0)'}}
                      onClick={() => { actions.modifyGrade(item.gradeId, Number(gradeInputs[item.gradeId])); alert('Grade modified'); }}
                    >Save</button>
                  </span>
                ) : (
                  <em style={{ marginLeft: 12, color: '#999', fontSize: '12px' }}>(modification window expired)</em>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <em style={{ color: '#999' }}>You haven't graded this project yet.</em>
                <Link to={`/project/${item.projectId}`} style={{ marginLeft: 12, color: '#1976d2', textDecoration: 'none', fontWeight: '500' }}>Open</Link>
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
};

export default Dashboard;