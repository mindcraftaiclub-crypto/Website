import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import db from '../db';

export default function Auth({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    className: '',
    registerNumber: '',
    phone: '',
    interestedArea: '',
    codingStyle: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/';

  useEffect(() => {
    if (user) navigate(redirectPath);
  }, [user, navigate, redirectPath]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await db.login(formData.email.trim(), formData.password);
      window.showToast('Login Successful', `Welcome back, ${result.user.name}!`, 'success');
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      window.showToast('Authentication Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      window.showToast('Insecure Password', 'Passwords must contain at least 6 characters.', 'warning');
      return;
    }
    if (!formData.codingStyle) {
      window.showToast('Required Fields', 'Please choose your coding style poll option.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const newUser = await db.register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.className.trim(),
        formData.registerNumber.trim(),
        formData.phone.trim(),
        formData.interestedArea.trim(),
        formData.codingStyle
      );
      window.showToast('Registration Successful', `Welcome to Mindcraft AI, ${formData.name}!`, 'success');
      setTimeout(() => {
        navigate(redirectPath);
      }, 1200);
    } catch (err) {
      window.showToast('Signup Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', padding: '2.5rem 1.25rem' }}>
      <div className="premium-auth-card" style={{
        width: '100%',
        maxWidth: activeTab === 'signup' ? '920px' : '780px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        minHeight: '520px'
      }}>
        
        {/* Left Side: Branding / Intro */}
        <div style={{
          background: 'linear-gradient(135deg, #090b11 0%, #151922 100%)',
          padding: '3.5rem 3rem',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Technical grid overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 85, 0, 0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            opacity: 0.7,
            pointerEvents: 'none'
          }} />

          {/* Glow Effect */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(255, 85, 0, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 10px var(--orange)' }}></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                Mindcraft AI
              </span>
            </div>

            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Fostering <span style={{ color: 'var(--orange)' }}>Creativity</span> & Collaborative <span style={{ borderBottom: '2.5px solid var(--orange)' }}>Development</span>.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '340px' }}>
              Join a community of innovative learners passionate about Artificial Intelligence and its real-world applications.
            </p>
          </div>

          {/* Highlight features */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {[
              { icon: 'fa-graduation-cap', title: 'Workshops & Seminars', desc: 'Enhance your AI skills with expert training.' },
              { icon: 'fa-laptop-code', title: 'Hackathons & Sprints', desc: 'Build and deploy neural networks collaboratively.' },
              { icon: 'fa-brain', title: 'Experiential Learning', desc: 'Explore state-of-the-art tools and frameworks.' }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 85, 0, 0.1)',
                  border: '1px solid rgba(255, 85, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--orange)',
                  fontSize: '0.85rem',
                  flexShrink: 0,
                  marginTop: '0.1rem'
                }}>
                  <i className={`fa-solid ${f.icon}`} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.83rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{f.title}</h4>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0.1rem 0 0 0', lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1, fontSize: '0.7rem', color: '#475569', marginTop: '2.5rem' }}>
            © {new Date().getFullYear()} Mindcraft AI Club. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div style={{
          padding: '3rem 3.5rem',
          background: 'var(--card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxHeight: '660px',
          overflowY: 'auto'
        }}>
          {/* Sign In / Sign Up switcher tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.75rem', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              style={{
                flex: 1, padding: '0.75rem',
                background: 'none', border: 'none',
                color: activeTab === 'signin' ? 'var(--orange)' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer',
                borderBottom: activeTab === 'signin' ? '2.5px solid var(--orange)' : '2.5px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              style={{
                flex: 1, padding: '0.75rem',
                background: 'none', border: 'none',
                color: activeTab === 'signup' ? 'var(--orange)' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer',
                borderBottom: activeTab === 'signup' ? '2.5px solid var(--orange)' : '2.5px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem'
              }}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}></i>
                  <input
                    type="email"
                    className="form-input"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@email.com"
                    style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '10px', height: '42px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="password" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%', borderRadius: '10px', height: '42px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute', right: '0.8rem', top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', height: '42px', borderRadius: '10px', fontWeight: 700, marginTop: '0.5rem' }}
              >
                {loading ? (
                  <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                ) : (
                  <>Sign In <i className="fa-solid fa-right-to-bracket" style={{ marginLeft: '0.4rem' }}></i></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="name" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-user" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}></i>
                  <input
                    type="text"
                    className="form-input"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    style={{ paddingLeft: '2.4rem', width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                  />
                </div>
              </div>

              {/* Class and Register Number Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="className" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Class *</label>
                  <input
                    type="text"
                    className="form-input"
                    id="className"
                    required
                    value={formData.className}
                    onChange={handleInputChange}
                    placeholder="e.g. 25CS2A"
                    style={{ width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="registerNumber" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Register Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    id="registerNumber"
                    required
                    value={formData.registerNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 732925CSR001"
                    style={{ width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                  />
                </div>
              </div>

              {/* Phone and Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="phone" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    style={{ width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="email" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email ID *</label>
                  <input
                    type="email"
                    className="form-input"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    style={{ width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="password" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password * (Min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    minLength={6}
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem', width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute', right: '0.8rem', top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="interestedArea" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Interested Area</label>
                <input
                  type="text"
                  className="form-input"
                  id="interestedArea"
                  value={formData.interestedArea}
                  onChange={handleInputChange}
                  placeholder="e.g. NLP, Computer Vision, MLOps"
                  style={{ width: '100%', borderRadius: '10px', height: '38px', border: '1px solid var(--border)', fontSize: '0.83rem' }}
                />
              </div>

              {/* Coding Style Vibe Poll */}
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Choose Your Style / Vibe *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {[
                    { id: 'hard_coding', label: '💻 Hard Coding', desc: 'Writing pure, manual code' },
                    { id: 'vibe_coding', label: '🎵 Vibe Coding', desc: 'Using AI tools & prompt flow' },
                    { id: 'exploring',   label: '🔍 Exploring',   desc: 'Testing ideas and research' },
                    { id: 'ai_or_other',  label: '🤖 AI & Tech',   desc: 'AI, data science or other fields' },
                  ].map(opt => {
                    const isSel = formData.codingStyle === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFormData(prev => ({ ...prev, codingStyle: opt.id }))}
                        style={{
                          border: `1px solid ${isSel ? 'var(--orange)' : 'var(--border)'}`,
                          background: isSel ? 'rgba(255,85,0,0.03)' : 'var(--surface)',
                          borderRadius: '10px',
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.1rem',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                          boxShadow: isSel ? '0 0 0 2px rgba(255,85,0,0.1)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isSel ? 'var(--orange)' : 'var(--text)' }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
                          {opt.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', height: '40px', borderRadius: '10px', fontWeight: 700, marginTop: '0.5rem' }}
              >
                {loading ? (
                  <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                ) : (
                  <>Submit Application <i className="fa-solid fa-user-plus" style={{ marginLeft: '0.4rem' }}></i></>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

      <style>{`
        .premium-auth-card {
          min-height: 520px;
        }
        @media (max-width: 768px) {
          .premium-auth-card {
            grid-template-columns: 1fr !important;
            max-width: 480px !important;
          }
          .premium-auth-card > div:first-child {
            display: none !important;
          }
          .premium-auth-card > div:last-child {
            padding: 2rem 1.75rem !important;
          }
        }
        .premium-auth-card > div:last-child::-webkit-scrollbar {
          width: 4px;
        }
        .premium-auth-card > div:last-child::-webkit-scrollbar-track {
          background: transparent;
        }
        .premium-auth-card > div:last-child::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .premium-auth-card > div:last-child::-webkit-scrollbar-thumb:hover {
          background: var(--orange);
        }
      `}</style>
    </div>
  );
}
