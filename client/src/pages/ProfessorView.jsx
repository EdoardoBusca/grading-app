// src/pages/ProfessorView.jsx
import { useContext } from 'react';
import { StoreContext } from '../App';
import { projectEvaluation } from '../services/store';

const ProfessorView = () => {
  const { state } = useContext(StoreContext);
  const isProfessor = state.users.find(u => u.id === state.currentUserId)?.role === 'professor';
  if (!isProfessor) {
    return <div style={{ padding: 20 }}>Access denied. Switch to a professor account via the top bar.</div>;
  }
  return (
    <div style={{ padding: '2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#f5f7fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '32px', fontWeight: '700', marginBottom: '2rem' }}>📊 Evaluation Results (Professor)</h1>
      {state.projects.length === 0 && <p style={{ color: '#999', fontSize: '16px', fontStyle: 'italic' }}>No projects created yet.</p>}
      {state.projects.map(p => {
        const evalData = projectEvaluation(state, p.id);
        return (
          <div key={p.id} style={{ border: 'none', borderRadius: '12px', marginTop: '20px', padding: '24px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #f57c00' }}>
            <h2 style={{ color: '#333', margin: '0 0 8px 0', fontSize: '22px', fontWeight: '700' }}>{p.title}</h2>
            <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: '14px' }}>{p.description}</p>
            {evalData.url && (
              <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: '14px' }}>
                🔗 <a href={evalData.url} target="_blank" rel="noreferrer" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '500' }}>View Project Submission</a>
              </p>
            )}
            {evalData.summary && evalData.summary.count ? (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f0f7ff', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div>
                    <span style={{ display: 'block', color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Submissions</span>
                    <strong style={{ color: '#2e7d32', fontSize: '20px' }}>{evalData.summary.count}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Average</span>
                    <strong style={{ color: '#2e7d32', fontSize: '20px' }}>{evalData.summary.average}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Min</span>
                    <strong style={{ color: '#d32f2f', fontSize: '20px' }}>{evalData.summary.min}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Max</span>
                    <strong style={{ color: '#2e7d32', fontSize: '20px' }}>{evalData.summary.max}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '16px', padding: '16px', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107', color: '#856404', fontSize: '14px' }}>
                ⏳ No grades submitted yet. Waiting for jury evaluations.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProfessorView;
