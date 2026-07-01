import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import db from '../db';
import TiltCard from '../components/TiltCard';

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await db.loginWithGoogle();
      window.showToast('Login Successful', `Welcome, ${result.user.name}!`, 'success');
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      window.showToast('Authentication Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-container">
      <TiltCard tiltDegree={5} glow={false}>
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '0.12em' }}>
              MINDCRAFT AI
            </span>
          </div>

            <div>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: 'none', border: 'none',
                    color: activeTab === 'signin' ? 'var(--orange)' : 'var(--text-muted)',
                    fontWeight: 600, cursor: 'pointer',
                    borderBottom: activeTab === 'signin' ? '2px solid var(--orange)' : '2px solid transparent',
                    transition: 'all 0.2s ease'
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
                    fontWeight: 600, cursor: 'pointer',
                    borderBottom: activeTab === 'signup' ? '2px solid var(--orange)' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sign Up
                </button>
              </div>

              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        id="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        style={{ width: '100%', paddingRight: '2.5rem' }}
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
                          fontSize: '1rem'
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
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {loading ? (
                      <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    ) : (
                      <>Sign In <i className="fa-solid fa-right-to-bracket"></i></>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Class and Register Number Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="className">Class *</label>
                      <input
                        type="text"
                        className="form-input"
                        id="className"
                        required
                        value={formData.className}
                        onChange={handleInputChange}
                        placeholder="e.g. 25CS2A"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="registerNumber">Register Number *</label>
                      <input
                        type="text"
                        className="form-input"
                        id="registerNumber"
                        required
                        value={formData.registerNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 732925CSR001"
                      />
                    </div>
                  </div>

                  {/* Phone and Email Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="email">Email ID *</label>
                      <input
                        type="email"
                        className="form-input"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="password">Password * (Min 6 chars)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        id="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        minLength={6}
                        style={{ width: '100%', paddingRight: '2.5rem' }}
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
                          fontSize: '1rem'
                        }}
                      >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="interestedArea">Interested Area</label>
                    <input
                      type="text"
                      className="form-input"
                      id="interestedArea"
                      value={formData.interestedArea}
                      onChange={handleInputChange}
                      placeholder="e.g. NLP, Computer Vision, MLOps"
                    />
                  </div>

                  {/* Coding Style Vibe Poll */}
                  <div>
                    <label className="form-label">Choose Your Style / Vibe *</label>
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
                              borderRadius: '8px',
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.1rem',
                              transition: 'all 0.2s ease',
                              textAlign: 'left'
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSel ? 'var(--orange)' : 'var(--text)' }}>
                              {opt.label}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
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
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    {loading ? (
                      <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    ) : (
                      <>Submit Application <i className="fa-solid fa-user-plus"></i></>
                    )}
                  </button>
                </form>
              )}

              <div className="auth-divider">or</div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', gap: '0.6rem', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}
              >
                {loading ? (
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ minWidth: '16px' }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
        </div>
      </TiltCard>
    </div>
  );
}
