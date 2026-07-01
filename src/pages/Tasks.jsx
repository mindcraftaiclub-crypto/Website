import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [expiredTasks, setExpiredTasks] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const fileInputsRef = useRef({});

  const fetchTasks = async () => {
    try {
      const list = await db.find('WeeklyTasks');
      setTasks(list);
      const subs = await db.find('TaskSubmissions');
      if (user) setMySubmissions(subs.filter(s => s.userId === user.id));
      const now = new Date();
      setActiveTasks(list.filter(t => new Date(t.deadline) > now));
      setExpiredTasks(list.filter(t => new Date(t.deadline) <= now));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const handleFileSelect = (taskId, file) => {
    if (file.size > 10 * 1024 * 1024) { window.showToast('File Too Large', 'Maximum file size is 10 MB.', 'error'); return; }
    setSelectedFiles(prev => ({ ...prev, [taskId]: file }));
  };

  const handleSubmit = async (taskId, taskTitle) => {
    const file = selectedFiles[taskId];
    if (!file) { window.showToast('No File', 'Please select a file to submit.', 'error'); return; }
    try {
      const fileUrl = await db.uploadFile(file, 'task-submissions');
      await db.insert('TaskSubmissions', {
        taskId, taskTitle, userId: user.id, userName: user.name,
        fileName: file.name, fileUrl, submittedAt: new Date().toISOString(), status: 'Pending',
      });
      window.showToast('Submitted!', 'Your task has been submitted for review.', 'success');
      setSelectedFiles(prev => { const copy = { ...prev }; delete copy[taskId]; return copy; });
      fetchTasks();
    } catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  const isSubmitted = (taskId) => mySubmissions.some(s => s.taskId === taskId);

  const getSubmissionStatus = (taskId) => {
    const sub = mySubmissions.find(s => s.taskId === taskId);
    if (!sub) return null;
    return sub.status;
  };

  const TaskCard = ({ task, active = true }) => (
    <TiltCard tiltDegree={5}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem' }}>{task.title}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>{task.description}</p>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          ⏰ Deadline: {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {active && user ? (
          isSubmitted(task.id) ? (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: getSubmissionStatus(task.id) === 'Approved' ? '#16a34a' : getSubmissionStatus(task.id) === 'Rejected' ? '#dc2626' : 'var(--orange)' }}>
                {getSubmissionStatus(task.id) === 'Approved' ? '✅ Approved' : getSubmissionStatus(task.id) === 'Rejected' ? '❌ Rejected' : '⏳ Submitted'}
              </span>
            </div>
          ) : (
            <div>
              <input type="file" ref={el => fileInputsRef.current[task.id] = el} onChange={(e) => handleFileSelect(task.id, e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => fileInputsRef.current[task.id]?.click()} style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}>
                  {selectedFiles[task.id] ? selectedFiles[task.id].name.substring(0, 20) : '📎 Choose File'}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleSubmit(task.id, task.title)} disabled={!selectedFiles[task.id]} style={{ borderRadius: 'var(--radius-sm)', opacity: selectedFiles[task.id] ? 1 : 0.5 }}>
                  Submit
                </button>
              </div>
            </div>
          )
        ) : active && !user ? (
          <Link to="/auth" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
            Sign In to Submit
          </Link>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Deadline passed</span>
        )}
      </div>
    </TiltCard>
  );

  return (
    <div className="animated-entrance">
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-square-check"></i> Challenges</span>
        <h2 className="page-title">Weekly Tasks</h2>
        <p className="page-subtitle">Sharpen your skills with weekly coding problems and design sprints. Submit your solutions for review.</p>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <>
          {activeTasks.length > 0 && (
            <Reveal direction="up">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#16a34a' }}>●</span> Active Tasks
              </h3>
              <div className="grid-auto" style={{ marginBottom: '3rem' }}>
                {activeTasks.map((task, i) => <Reveal key={task.id} direction="up" delay={`${i * 0.08}s`}><TaskCard task={task} active /></Reveal>)}
              </div>
            </Reveal>
          )}

          {expiredTasks.length > 0 && (
            <Reveal direction="up" delay="0.1s">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>●</span> Past Tasks
              </h3>
              <div className="grid-auto">
                {expiredTasks.map((task, i) => <Reveal key={task.id} direction="up" delay={`${i * 0.05}s`}><TaskCard task={task} active={false} /></Reveal>)}
              </div>
            </Reveal>
          )}
        </>
      )}

      {!loading && tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
          <p>No tasks available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
