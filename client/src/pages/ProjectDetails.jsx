// src/pages/ProjectDetails.jsx
import { useParams, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { StoreContext } from '../App';
import { getCurrentUser, isProjectPM, isJuryForDeliverable, deliverableGrades, computeSummary } from '../services/store';

const ProjectDetails = () => {
  const { id } = useParams();
  const { state, actions } = useContext(StoreContext);
  const project = state.projects.find(p => p.id === parseInt(id, 10));
  const user = getCurrentUser(state);
  if (!project) return <div style={{padding: 20}}>Project not found (ID: {id})</div>;

  const [newDeliverable, setNewDeliverable] = useState({ title: '', dueDate: '' });
  const [mediaForm, setMediaForm] = useState({ deliverableId: 0, videoUrl: '', demoUrl: '' });
  const [juryForm, setJuryForm] = useState({ deliverableId: 0, count: 3 });
  const [gradeInputs, setGradeInputs] = useState({}); // per deliverableId

  const isPM = isProjectPM(state, project, state.currentUserId);
  const deliverables = state.deliverables.filter(d => d.projectId === project.id);

  const onAddDeliverable = (e) => {
    e.preventDefault();
    if (!isPM) return alert('Only PM can add deliverables');
    if (!newDeliverable.title || !newDeliverable.dueDate) return alert('Title and due date required');
    actions.addDeliverable(project.id, newDeliverable);
    setNewDeliverable({ title: '', dueDate: '' });
  };

  const onAddMedia = (e) => {
    e.preventDefault();
    if (!isPM) return alert('Only PM can add media');
    if (!mediaForm.deliverableId) return alert('Select a deliverable');
    actions.addMedia(mediaForm.deliverableId, { videoUrl: mediaForm.videoUrl, demoUrl: mediaForm.demoUrl });
    setMediaForm({ deliverableId: 0, videoUrl: '', demoUrl: '' });
  };

  const onSelectJury = (e) => {
    e.preventDefault();
    if (!isPM && user.role !== 'professor') return alert('Only PM or professor can select jury');
    if (!juryForm.deliverableId) return alert('Select a deliverable');
    actions.selectJury(juryForm.deliverableId, juryForm.count);
  };

  const onSubmitGrade = (deliverableId) => {
    const val = gradeInputs[deliverableId];
    if (val === undefined || val === null || val === '') return alert('Enter a grade');
    if (!isJuryForDeliverable(state, deliverableId, state.currentUserId)) return alert('Only jury can grade this deliverable');
    actions.submitGrade(deliverableId, Number(val));
    alert('Grade submitted');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>Project: {project.title}</h1>
      <p><strong>Description:</strong> {project.description}</p>

      {isPM && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <form onSubmit={onAddDeliverable} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <h3>Add Deliverable</h3>
            <input type="text" placeholder="Title" value={newDeliverable.title} onChange={(e)=>setNewDeliverable({ ...newDeliverable, title: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <input type="date" placeholder="Due Date" value={newDeliverable.dueDate} onChange={(e)=>setNewDeliverable({ ...newDeliverable, dueDate: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <button type="submit" style={{ padding: '8px 12px' }}>Add</button>
          </form>

          <form onSubmit={onAddMedia} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <h3>Add Media (video/demo)</h3>
            <select value={mediaForm.deliverableId} onChange={(e)=>setMediaForm({ ...mediaForm, deliverableId: parseInt(e.target.value, 10) })} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
              <option value={0}>Select deliverable</option>
              {deliverables.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
            <input type="url" placeholder="Video URL" value={mediaForm.videoUrl} onChange={(e)=>setMediaForm({ ...mediaForm, videoUrl: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <input type="url" placeholder="Demo URL" value={mediaForm.demoUrl} onChange={(e)=>setMediaForm({ ...mediaForm, demoUrl: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <button type="submit" style={{ padding: '8px 12px' }}>Save</button>
          </form>

          <form onSubmit={onSelectJury} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <h3>Select Jury (after due date)</h3>
            <select value={juryForm.deliverableId} onChange={(e)=>setJuryForm({ ...juryForm, deliverableId: parseInt(e.target.value, 10) })} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
              <option value={0}>Select deliverable</option>
              {deliverables.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
            <input type="number" min={1} max={10} value={juryForm.count} onChange={(e)=>setJuryForm({ ...juryForm, count: parseInt(e.target.value, 10) })} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <button type="submit" style={{ padding: '8px 12px' }}>Randomize Jury</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <h2>Deliverables</h2>
        {deliverables.length === 0 && <p>No deliverables yet.</p>}
        {deliverables.map(d => {
          const g = deliverableGrades(state, d.id);
          const summary = computeSummary(g.map(x => x.value));
          const isJury = isJuryForDeliverable(state, d.id, state.currentUserId);
          const myGrade = g.find(x => x.graderId === state.currentUserId);
          const canModify = myGrade ? ((new Date() - new Date(myGrade.submittedAt)) / (1000*60)) <= 1440 : false;
          return (
            <div key={d.id} style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px', marginBottom: '12px', background: '#fff' }}>
              <h3>{d.title}</h3>
              <p><strong>Due:</strong> {d.dueDate}</p>
              {(d.media.videoUrl || d.media.demoUrl) && (
                <p>
                  {d.media.videoUrl && <>🎬 <a href={d.media.videoUrl} target="_blank" rel="noreferrer">Video</a>{' '}</>}
                  {d.media.demoUrl && <>🚀 <a href={d.media.demoUrl} target="_blank" rel="noreferrer">Demo</a></>}
                </p>
              )}
              {d.juryUserIds?.length ? <p>Jury members assigned: {d.juryUserIds.length}</p> : <p>No jury assigned yet.</p>}

              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #ddd' }}>
                <strong>Summary (anonymous):</strong>{' '}
                {summary.count ? (
                  <span>{summary.count} grades • avg {summary.average} (min {summary.min}, max {summary.max})</span>
                ) : (
                  <span>No grades yet.</span>
                )}
              </div>

              {isJury ? (
                <div style={{ marginTop: 12 }}>
                  <p>You are on this deliverable's jury. Submit your anonymous grade.</p>
                  <input type="number" min={1} max={10} step={0.01} value={gradeInputs[d.id] ?? ''} onChange={(e)=>setGradeInputs({ ...gradeInputs, [d.id]: e.target.value })} style={{ padding: 8, width: 100 }} />
                  <button onClick={()=>onSubmitGrade(d.id)} style={{ marginLeft: 8, padding: '6px 10px' }}>Submit</button>
                  {myGrade && (
                    <div style={{ marginTop: 8 }}>
                      <span>Your grade: {myGrade.value}</span>
                      {canModify ? (
                        <span style={{ marginLeft: 8 }}>
                          <input type="number" min={1} max={10} step={0.01} placeholder="Modify" value={gradeInputs[`mod-${d.id}`] ?? ''} onChange={(e)=>setGradeInputs({ ...gradeInputs, ["mod-"+d.id]: e.target.value })} style={{ padding: 6, width: 100 }} />
                          <button style={{ marginLeft: 6, padding: '6px 10px' }} onClick={()=>{ actions.modifyGrade(myGrade.id, Number(gradeInputs[`mod-${d.id}`])); alert('Grade modified'); }}>Save</button>
                        </span>
                      ) : (
                        <em style={{ marginLeft: 8 }}>(modification window expired)</em>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <em style={{ display: 'block', marginTop: 8 }}>You are not on the jury for this deliverable.</em>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetails;