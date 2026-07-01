import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

const PERKS = [
  { icon: 'fa-brain', title: 'AI / ML Projects', desc: 'Work on real-world machine learning and AI challenges.' },
  { icon: 'fa-users', title: 'Expert Network', desc: 'Collaborate with top students and industry mentors.' },
  { icon: 'fa-trophy', title: 'Club Events & Prizes', desc: 'Compete in exclusive club events and win rewards.' },
  { icon: 'fa-book-open', title: 'Premium Resources', desc: 'Unlock curated notes, datasets, and research papers.' },
  { icon: 'fa-certificate', title: 'Certificates', desc: 'Earn verifiable certificates for workshops & events.' },
  { icon: 'fa-rocket', title: 'Career Launchpad', desc: 'Get referrals, resume reviews, and internship leads.' },
];

const defaultFormFields = [
  { id: 'name', label: 'Full Name', type: 'text', required: true },
  { id: 'email', label: 'Email Address', type: 'email', required: true },
  { id: 'department', label: 'Department', type: 'text', required: true },
  { id: 'college', label: 'College Name', type: 'text', required: true },
  { id: 'year', label: 'Year of Study', type: 'select', required: true, options: ['1', '2', '3', '4'] },
  { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { id: 'skills', label: 'Skills (comma separated)', type: 'text' },
  { id: 'interests', label: 'Areas of Interest', type: 'text' },
];

export default function Join({ user }) {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const custom = await db.find('JoinFormFields');
        if (custom.length > 0) setFormFields(custom);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await db.insert('JoinRequests', {
        ...formData, status: 'Pending', submittedAt: new Date().toISOString(),
      });
      window.showToast('Application Submitted', 'Your request has been sent to the club board.', 'success');
      setSubmitted(true);
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  if (user) {
    return (
      <div className="animated-entrance" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.75rem' }}>You're Already a Member!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Welcome to Mindcraft AI, {user.name}. You can access all club resources from the dashboard.</p>
        <Link to="/resources" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)' }}>
          <i className="fa-solid fa-book"></i> Explore Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="animated-entrance">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <span className="page-tag"><i className="fa-solid fa-hand-fist"></i> Recruitment</span>
        <h2 className="page-title">Join Mindcraft AI</h2>
        <p className="page-subtitle" style={{ margin: '0 auto' }}>Applications are open for the 2026–27 academic year. Fill out the form below to become part of CSE's premier AI club.</p>
      </div>

      <Reveal direction="up">
        <div className="grid-auto" style={{ marginBottom: '3rem' }}>
          {PERKS.map((p, i) => (
            <Reveal key={p.title} direction="up" delay={`${i * 0.06}s`}>
              <TiltCard tiltDegree={5}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(var(--orange-rgb), 0.08)', border: '1px solid rgba(var(--orange-rgb), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--orange)', margin: '0 auto 0.75rem' }}>
                    <i className={`fa-solid ${p.icon}`}></i>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{p.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal direction="up" delay="0.1s">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {submitted ? (
            <TiltCard tiltDegree={3}>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Application Received!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>The club board will review your application and get back to you soon.</p>
                <button className="btn btn-outline" onClick={() => { setSubmitted(false); setFormData({}); }} style={{ borderRadius: 'var(--radius-md)' }}>Submit Another</button>
              </div>
            </TiltCard>
          ) : (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)', padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
            }}>
              <form onSubmit={handleSubmit}>
                {formFields.map(field => (
                  <div className="form-group" key={field.id}>
                    <label className="form-label" htmlFor={field.id}>
                      {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select className="form-select" id={field.id} value={formData[field.id] || ''} onChange={handleChange} required={field.required}>
                        <option value="">Select...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea className="form-textarea" id={field.id} value={formData[field.id] || ''} onChange={handleChange} required={field.required} />
                    ) : (
                      <input className="form-input" type={field.type} id={field.id} value={formData[field.id] || ''} onChange={handleChange} required={field.required} />
                    )}
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <i className="fa-solid fa-paper-plane"></i> Submit Application
                </button>
              </form>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
