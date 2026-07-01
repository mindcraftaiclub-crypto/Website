import { useState } from 'react';
import db from '../db';
import Reveal from '../components/Reveal';

export default function Join() {
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    registerNumber: '',
    phone: '',
    email: '',
    interestedArea: '',
    codingStyle: '', // For the poll/coding style question
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStyleSelect = (val) => {
    setFormData(prev => ({ ...prev, codingStyle: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.className || !formData.registerNumber || !formData.phone || !formData.email || !formData.codingStyle) {
      window.showToast('Validation Error', 'Please fill out all required fields and complete the style poll.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await db.insert('JoinRequests', {
        ...formData,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
      });
      window.showToast('Application Submitted', 'Thank you! Your registration has been received.', 'success');
      setSubmitted(true);
    } catch (err) {
      window.showToast('Submission Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-entrance" style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="page-tag" style={{ justifyContent: 'center' }}><i className="fa-solid fa-file-signature"></i> Application Form</span>
        <h2 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem' }}>Join Mindcraft AI</h2>
        <p className="page-subtitle" style={{ margin: '0.5rem auto 0', maxWidth: '480px' }}>Fill out the recruitment details below to apply for membership.</p>
      </div>

      <Reveal direction="up">
        {submitted ? (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🎉</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
              Application Successfully Sent!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Thank you for applying. The Mindcraft AI Core Board will review your register details and contact you via email or phone.
            </p>
            <button className="btn btn-outline" onClick={() => { setSubmitted(false); setFormData({ name: '', className: '', registerNumber: '', phone: '', email: '', interestedArea: '', codingStyle: '' }); }} style={{ borderRadius: '10px' }}>
              Submit Another Application
            </button>
          </div>
        ) : (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Full Name */}
              <div>
                <label htmlFor="name" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Full Name <span style={{ color: 'var(--orange)' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                  <i className="fa-solid fa-user" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                  <input id="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} required style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
                </div>
              </div>

              {/* Class and Register Number Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Class */}
                <div>
                  <label htmlFor="className" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Class <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                    <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                    <input id="className" type="text" placeholder="e.g. 25CS2A" value={formData.className} onChange={handleChange} required style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
                  </div>
                </div>

                {/* Register Number */}
                <div>
                  <label htmlFor="registerNumber" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Register Number <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                    <i className="fa-solid fa-id-card" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                    <input id="registerNumber" type="text" placeholder="e.g. 732925CSR001" value={formData.registerNumber} onChange={handleChange} required style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Phone and Email ID Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Phone Number <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                    <i className="fa-solid fa-phone" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                    <input id="phone" type="tel" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
                  </div>
                </div>

                {/* Email ID */}
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Email ID <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                    <i className="fa-solid fa-envelope" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                    <input id="email" type="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} required style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Interested Area */}
              <div>
                <label htmlFor="interestedArea" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Interested Area
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                  <i className="fa-solid fa-brain" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                  <input id="interestedArea" type="text" placeholder="e.g. NLP, Computer Vision, MLOps" value={formData.interestedArea} onChange={handleChange} style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
                </div>
              </div>

              {/* Coding Style Poll */}
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.6rem' }}>
                  Choose Your Style / Vibe <span style={{ color: 'var(--orange)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { id: 'hard_coding', label: '💻 Hard Coding', desc: 'Writing pure, manual code' },
                    { id: 'vibe_coding', label: '🎵 Vibe Coding', desc: 'Using AI tools & prompt flow' },
                    { id: 'exploring',   label: '🔍 Exploring',   desc: 'Testing ideas and research' },
                    { id: 'ai_or_other',  label: '🤖 AI & Tech',   desc: 'AI, data science or other fields' },
                  ].map(styleOpt => {
                    const isSelected = formData.codingStyle === styleOpt.id;
                    return (
                      <div
                        key={styleOpt.id}
                        onClick={() => handleStyleSelect(styleOpt.id)}
                        style={{
                          border: `1px solid ${isSelected ? 'var(--orange)' : 'var(--border)'}`,
                          background: isSelected ? 'rgba(255,85,0,0.03)' : 'var(--surface)',
                          borderRadius: '10px',
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          transition: 'all 0.22s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--text-muted)';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? 'var(--orange)' : 'var(--text)' }}>
                          {styleOpt.label}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {styleOpt.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '1rem',
                  borderRadius: '10px',
                  padding: '0.78rem 1.5rem',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                }}
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> Submitting Application…</>
                ) : (
                  <><i className="fa-solid fa-paper-plane" style={{ marginRight: '0.5rem' }}></i> Submit Application</>
                )}
              </button>

            </form>
          </div>
        )}
      </Reveal>
    </div>
  );
}
