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
    <div style={{ padding: '2rem' }}>
      <h1>📊 Evaluation Results (Professor)</h1>
      {state.projects.length === 0 && <p>No projects yet.</p>}
      {state.projects.map(p => {
        const evalData = projectEvaluation(state, p.id);
        return (
          <div key={p.id} style={{ border: '1px solid #ccc', borderRadius: 8, marginTop: 16, padding: 16, background: '#fff' }}>
            <h2>{p.title}</h2>
            {(evalData?.evaluations?.length || 0) === 0 && <p>No deliverables.</p>}
            {(evalData?.evaluations || []).map(ev => (
              <div key={ev.deliverableId} style={{ borderTop: '1px dashed #ddd', paddingTop: 8, marginTop: 8 }}>
                <strong>{ev.title}</strong> <em>(due {ev.dueDate})</em>
                {(ev.media.videoUrl || ev.media.demoUrl) && (
                  <div style={{ marginTop: 4 }}>
                    {ev.media.videoUrl && <>🎬 <a href={ev.media.videoUrl} target="_blank" rel="noreferrer">Video</a>{' '}</>}
                    {ev.media.demoUrl && <>🚀 <a href={ev.media.demoUrl} target="_blank" rel="noreferrer">Demo</a></>}
                  </div>
                )}
                {ev.summary && ev.summary.count ? (
                  <div style={{ marginTop: 6 }}>
                    Grades: {ev.summary.count} • Average: <strong>{ev.summary.average}</strong> • Min: {ev.summary.min} • Max: {ev.summary.max}
                  </div>
                ) : (
                  <div style={{ marginTop: 6 }}>No grades yet.</div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ProfessorView;
