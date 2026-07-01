import { useState } from 'react';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

export default function Contact() {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.showToast('Message Sent', 'Your inquiry has been successfully sent to the board.', 'success');
    setSuccess(true);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setSuccess(false);
  };

  return (
    <div className="animated-entrance">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <span className="page-tag"><i className="fa-solid fa-phone"></i> Connect</span>
        <h2 className="page-title">Get in Touch</h2>
        <p className="page-subtitle" style={{ margin: '0 auto' }}>Have a question, suggestion, or collaboration idea? We'd love to hear from you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
        <Reveal direction="left">
          <TiltCard tiltDegree={5}>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)', padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-envelope" style={{ color: 'var(--orange)', marginRight: '0.5rem' }}></i> Send a Message
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Name <span style={{ color: '#dc2626' }}>*</span></label>
                  <input className="form-input" type="text" id="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email <span style={{ color: '#dc2626' }}>*</span></label>
                  <input className="form-input" type="email" id="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message <span style={{ color: '#dc2626' }}>*</span></label>
                  <textarea className="form-textarea" id="message" rows={4} value={formData.message} onChange={handleChange} required />
                </div>
                {success ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" type="button" onClick={handleReset} style={{ flex: 1, borderRadius: 'var(--radius-md)' }}>
                      <i className="fa-solid fa-undo"></i> Send Another
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                    <i className="fa-solid fa-paper-plane"></i> Send Message
                  </button>
                )}
              </form>
            </div>
          </TiltCard>
        </Reveal>

        <Reveal direction="right" delay="0.1s">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: 'fa-envelope', title: 'Email', desc: 'mindcraftaiclub@gmail.com', color: 'var(--orange)' },
              { icon: 'fa-location-dot', title: 'Location', desc: 'CSE Department, Tech Block', color: 'var(--orange)' },
              { icon: 'fa-clock', title: 'Club Hours', desc: 'Weekly meets every Friday, 4 PM', color: 'var(--orange)' },
              { icon: 'fa-hashtag', title: 'Social', desc: '@mindcraft_ai (Instagram, LinkedIn)', color: 'var(--orange)' },
            ].map((item, i) => (
              <Reveal key={i} direction="up" delay={`${i * 0.08}s`}>
                <TiltCard tiltDegree={4}>
                  <div style={{
                    background: 'var(--card)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem',
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(var(--orange-rgb), 0.08)', border: '1px solid rgba(var(--orange-rgb), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--orange)', flexShrink: 0 }}>
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
