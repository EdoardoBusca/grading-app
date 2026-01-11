// src/pages/ProjectDetails.jsx
import { useParams, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { StoreContext } from '../App';
import { getCurrentUser, isProjectPM, isJuryForProject, deliverableGrades, computeSummary } from '../services/store';

const ProjectDetails = () => {
  const { id } = useParams();
  const { state, actions } = useContext(StoreContext);
  const project = state.projects.find(p => p.id === parseInt(id, 10));
  const user = getCurrentUser(state);

  if (!project) return <div style={{padding: 20}}>Project not found (ID: {id})</div>;

  const [urlInput, setUrlInput] = useState(project.url || '');
  const [gradeInput, setGradeInput] = useState('');
  const [juryPassword, setJuryPassword] = useState('');
  const [isJuryAuthenticated, setIsJuryAuthenticated] = useState(false);

  const isPM = isProjectPM(state, project, state.currentUserId);
  const isJury = isJuryForProject(state, project.id, state.currentUserId);
  const grades = deliverableGrades(state, project.id);
  const summary = computeSummary(grades.map(g => g.value));
  const myGrade = grades.find(g => g.graderId === state.currentUserId);
  const canModify = myGrade ? ((new Date() - new Date(myGrade.submittedAt)) / (1000*60)) <= 1440 : false;

  const onAddURL = () => {
    if (!urlInput) return alert('Enter a URL');
    actions.addURL(project.id, urlInput);
    alert('URL saved');
  };

  const onSubmitGrade = () => {
    const val = gradeInput;
    if (val === '' || val === null) return alert('Enter a grade');
    if (!isJury) return alert('Only jury can grade this project');
    if (!isJuryAuthenticated) return alert('Please authenticate first');
    actions.submitGrade(project.id, Number(val));
    alert('Grade submitted');
    setGradeInput('');
  };

  const onAuthenticateJury = () => {
    const expectedPassword = user.role === 'jury' ? 'jury123' : user.name.toLowerCase() + '123';
    if (juryPassword === expectedPassword) {
      setIsJuryAuthenticated(true);
      alert('Authentication successful! You can now grade this project.');
    } else {
      alert('Incorrect password. Please try again.');
      setJuryPassword('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#f5f7fa', minHeight: '100vh' }}>
      <Link to="/client/dashboard" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '500', marginBottom: '1.5rem', display: 'inline-block', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#1565c0'} onMouseLeave={(e) => e.target.style.color = '#1976d2'}>← Back to Dashboard</Link>
      <h1 style={{ color: '#333', fontSize: '32px', fontWeight: '700', marginBottom: '0.5rem' }}>Project: {project.title}</h1>
      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 2rem 0' }}><strong>Description:</strong> {project.description}</p>

      {isPM && (
        <div style={{ background: 'white', border: 'none', padding: '24px', borderRadius: '12px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #1976d2' }}>
          <h3 style={{ color: '#1976d2', margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>🔗 Add/Update URL</h3>
          <input
            type="url"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '14px', transition: 'all 0.2s' }}
            onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
          />
          <button onClick={onAddURL} style={{ padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', fontSize: '14px' }} onMouseEnter={(e) => { e.target.style.background = '#1565c0'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(25,118,210,0.3)'; }} onMouseLeave={(e) => { e.target.style.background = '#1976d2'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>Save URL</button>
        </div>
      )}

      <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color: '#333', margin: '0 0 16px 0', fontSize: '22px', fontWeight: '600' }}>📋 Project Details</h2>
        {project.url && (
          <p style={{ color: '#666', margin: '0 0 12px 0', fontSize: '14px' }}>
            🔗 <a href={project.url} target="_blank" rel="noreferrer" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '500' }}>View Project</a>
          </p>
        )}
        {project.juryUserIds?.length ? (
          <p style={{ color: '#666', margin: '0 0 12px 0', fontSize: '14px' }}><strong>Jury Members:</strong> {project.juryUserIds.length} assigned</p>
        ) : (
          <p style={{ color: '#999', margin: '0 0 12px 0', fontSize: '14px', fontStyle: 'italic' }}>No jury assigned yet.</p>
        )}

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #eee' }}>
          <h3 style={{ color: '#666', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Grade Summary (Anonymous)</h3>
          {summary.count ? (
            <div style={{ background: '#f0f7ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
              <strong style={{ color: '#2e7d32', fontSize: '15px' }}>{summary.count}</strong> <span style={{ color: '#666', fontSize: '14px' }}>grades submitted</span> • 
              <strong style={{ color: '#2e7d32', fontSize: '15px', marginLeft: '8px' }}>{summary.average}</strong> <span style={{ color: '#666', fontSize: '14px' }}>average</span> • 
              <span style={{ color: '#999', fontSize: '13px', marginLeft: '8px' }}>range {summary.min}–{summary.max}</span>
            </div>
          ) : (
            <em style={{ color: '#999', fontSize: '14px' }}>No grades submitted yet.</em>
          )}
        </div>
      </div>

      {isJury ? (
        <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #d32f2f' }}>
          <h3 style={{ color: '#d32f2f', margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>📝 Your Anonymous Grade</h3>
          
          {!isJuryAuthenticated ? (
            <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
              <h4 style={{ color: '#856404', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>🔒 Authentication Required</h4>
              <p style={{ color: '#856404', margin: '0 0 16px 0', fontSize: '14px' }}>Please enter your password to access grading:</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="password"
                  value={juryPassword}
                  onChange={(e) => setJuryPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ffc107', fontFamily: 'inherit', fontSize: '14px', width: '200px', transition: 'all 0.2s' }}
                  onKeyPress={(e) => { if (e.key === 'Enter') onAuthenticateJury(); }}
                  onFocus={(e) => { e.target.style.borderColor = '#ff9800'; e.target.style.boxShadow = '0 0 0 3px rgba(255,152,0,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#ffc107'; e.target.style.boxShadow = 'none'; }}
                />
                <button onClick={onAuthenticateJury} style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', fontSize: '14px' }} onMouseEnter={(e) => { e.target.style.background = '#f57c00'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(255,152,0,0.3)'; }} onMouseLeave={(e) => { e.target.style.background = '#ff9800'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
                  Authenticate
                </button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: '14px' }}>Submit a grade from 1 to 10 (up to 2 decimal places).</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.01}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '14px', width: '120px', transition: 'all 0.2s' }}
                  placeholder="8.50"
                  onFocus={(e) => { e.target.style.borderColor = '#d32f2f'; e.target.style.boxShadow = '0 0 0 3px rgba(211,47,47,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
                />
                <button onClick={onSubmitGrade} style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', fontSize: '14px' }} onMouseEnter={(e) => { e.target.style.background = '#45a049'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(76,175,80,0.3)'; }} onMouseLeave={(e) => { e.target.style.background = '#4caf50'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
                  Submit
                </button>
              </div>
            </>
          )}
          {myGrade && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
              <span style={{ color: '#333', fontSize: '14px' }}>Your grade: <strong style={{ color: '#2e7d32', fontSize: '16px' }}>{myGrade.value}</strong></span>
              {canModify ? (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.01}
                    placeholder="New grade"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #4caf50', fontFamily: 'inherit', fontSize: '13px', width: '100px' }}
                  />
                  <button
                    style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.target.style.background = '#45a049'; e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.target.style.background = '#4caf50'; e.target.style.transform = 'translateY(0)'; }}
                    onClick={() => { actions.modifyGrade(myGrade.id, Number(gradeInput)); alert('Grade modified'); }}
                  >Update</button>
                  <em style={{ color: '#666', fontSize: '12px', fontStyle: 'italic' }}>(within 24h window)</em>
                </div>
              ) : (
                <em style={{ display: 'block', marginTop: '8px', color: '#d32f2f', fontSize: '12px' }}>⏱️ Modification window expired (24h passed)</em>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: '24px', padding: '16px', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107', color: '#856404', fontSize: '14px' }}>
          ⚠️ You are not on the jury for this project.
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;