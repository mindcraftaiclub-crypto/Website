import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import db from '../db';

/* ─── Modern card input with left icon ─── */
const CardInput = ({ type = 'text', id, placeholder, value, onChange, icon, required = false, minLength, children, style = {} }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    background: '#f3f4f6',
    borderRadius: '8px',
    padding: '0.45rem 1rem',
    border: '1.5px solid transparent',
    transition: 'all 0.2s ease',
    width: '100%',
    ...style
  }}
  onFocusCapture={e => {
    e.currentTarget.style.background = '#fff';
    e.currentTarget.style.borderColor = 'var(--orange)';
    e.currentTarget.style.boxShadow = '0 0 0 4px var(--orange-glow)';
  }}
  onBlurCapture={e => {
    e.currentTarget.style.background = '#f3f4f6';
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    {icon && <i className={icon} style={{ color: '#6b7280', marginRight: '0.75rem', fontSize: '0.92rem' }} />}
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      style={{
        border: 'none',
        background: 'transparent',
        padding: '0.35rem 0',
        fontSize: '0.88rem',
        color: '#1e293b',
        outline: 'none',
        width: '100%',
      }}
    />
    {children}
  </div>
);

export default function Signup({ user }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    className: '', registerNumber: '',
    phone: '', interestedArea: '', codingStyle: '',
  });

  const params       = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/';

  /* redirect if already logged in */
  useEffect(() => { if (user) navigate(redirectPath); }, [user]);

  const set = id => e => setForm(p => ({ ...p, [id]: e.target.value }));

  /* ── sign-up ── */
  const handleSignUp = async e => {
    e.preventDefault();
    if (form.password.length < 6) {
      window.showToast('Weak Password', 'At least 6 characters required.', 'warning'); return;
    }
    if (!form.codingStyle) {
      window.showToast('Missing Field', 'Please choose your coding style.', 'warning'); return;
    }
    if (!agreed) {
      window.showToast('Terms Required', 'Please agree to the Terms and Conditions.', 'warning'); return;
    }
    setLoading(true);
    try {
      await db.register(
        form.name.trim(), form.email.trim(), form.password,
        form.className.trim(), form.registerNumber.trim(),
        form.phone.trim(), form.interestedArea.trim(), form.codingStyle,
      );
      window.showToast('Welcome!', `Registered successfully, ${form.name}!`, 'success');
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      window.showToast('Signup Failed', err.message, 'error');
    } finally { setLoading(false); }
  };

  /* ════════════════════════════════════════ RENDER ════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      background: '#fff',
    }}>

      {/* ── outer card ── */}
      <div className="auth-split-card" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.25fr',
        width: '100%',
        minHeight: 'calc(100vh - 70px)',
        background: '#fff'
      }}>

        {/* ══════ LEFT — vibrant orange panel ══════ */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5500 0%, #ff8833 100%)',
          padding: '3.5rem 2.8rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1
        }}>
          {/* Floating Spheres */}
          <div style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            top: '-60px',
            right: '-100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff8833 0%, #ff5500 100%)',
            boxShadow: 'inset -25px -25px 60px rgba(0,0,0,0.4), 10px 10px 40px rgba(0,0,0,0.15)',
            zIndex: 0,
            opacity: 0.8
          }} />
          <div style={{
            position: 'absolute',
            width: '190px',
            height: '190px',
            bottom: '-40px',
            left: '-60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff5500 0%, #cc3300 100%)',
            boxShadow: 'inset -15px -15px 40px rgba(0,0,0,0.3), 10px 10px 30px rgba(0,0,0,0.1)',
            zIndex: 0,
            opacity: 0.9
          }} />
          <div style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            bottom: '80px',
            right: '-30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffaa66 0%, #ff5500 100%)',
            boxShadow: 'inset -15px -15px 35px rgba(0,0,0,0.35), 5px 15px 30px rgba(0,0,0,0.15)',
            zIndex: 0,
            opacity: 0.95
          }} />

          {/* bottom tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', position: 'relative', zIndex: 1 }}>
            {['LLMs', 'CV', 'Speech AI', 'MLOps', 'Research'].map(t => (
              <span key={t} style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px', padding: '3px 10px',
                fontSize: '0.7rem', fontWeight: 600, color: '#fff',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ══════ RIGHT — white form panel ══════ */}
        <div className="auth-form-scroll" style={{
          background: '#fff',
          padding: '2.5rem 3rem 3rem 3rem',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 70px)',
        }}>

          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
              Sign up
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Join Mindcraft AI Club. Enter your details below.
            </p>

            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Grid row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CardInput id="name" placeholder="Full Name *" value={form.name} onChange={set('name')} icon="fa-solid fa-user" required />
                <CardInput id="className" placeholder="Class *" value={form.className} onChange={set('className')} icon="fa-solid fa-chalkboard" required />
              </div>

              {/* Grid row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CardInput id="registerNumber" placeholder="Register Number *" value={form.registerNumber} onChange={set('registerNumber')} icon="fa-solid fa-id-card" required />
                <CardInput type="tel" id="phone" placeholder="Phone Number *" value={form.phone} onChange={set('phone')} icon="fa-solid fa-phone" required />
              </div>

              <CardInput type="email" id="email" placeholder="Enter your email *" value={form.email} onChange={set('email')} icon="fa-solid fa-envelope" required />

              {/* password row */}
              <CardInput
                type={showPw ? 'text' : 'password'}
                id="password" 
                placeholder="Choose Password *"
                value={form.password} 
                onChange={set('password')} 
                icon="fa-solid fa-lock" 
                required
                minLength={6}
              >
                <button 
                  type="button" 
                  onClick={() => setShowPw(p => !p)}
                  style={{ 
                    color: 'var(--orange)', 
                    fontWeight: 700, 
                    fontSize: '0.75rem', 
                    cursor: 'pointer', 
                    marginLeft: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </CardInput>

              <CardInput id="interestedArea" placeholder="Interested Area (e.g. NLP, Computer Vision)" value={form.interestedArea} onChange={set('interestedArea')} icon="fa-solid fa-brain" />

              {/* vibe picker */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', margin: '0.4rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Choose Your Style *
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  {[
                    { id: 'hard_coding', label: '💻 Hard Coding',  desc: 'Pure, manual code' },
                    { id: 'vibe_coding', label: '🎵 Vibe Coding',  desc: 'AI tools & prompts' },
                    { id: 'exploring',   label: '🔍 Exploring',    desc: 'Ideas & research' },
                    { id: 'ai_or_other', label: '🤖 AI & Tech',    desc: 'Data science & AI' },
                  ].map(opt => {
                    const sel = form.codingStyle === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setForm(p => ({ ...p, codingStyle: opt.id }))} style={{
                        border: `1.5px solid ${sel ? 'var(--orange)' : '#e2e8f0'}`,
                        background: sel ? 'var(--orange-glow)' : '#fafafa',
                        borderRadius: '8px', padding: '0.4rem 0.6rem',
                        cursor: 'pointer', transition: 'all 0.18s',
                      }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: sel ? 'var(--orange)' : '#334155' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* agree checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ accentColor: 'var(--orange)', width: '15px', height: '15px', cursor: 'pointer' }} />
                Agreed to{' '}
                <span onClick={e => { e.preventDefault(); setShowTermsModal(true); }}
                  style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                  Terms and Conditions
                </span>
              </label>

              {/* submit */}
              <button type="submit" disabled={loading} style={{
                background: 'var(--orange)', 
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', width: '100%',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.3rem',
                boxShadow: 'var(--shadow-sm)'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.transform = 'none'; }}
              >
                {loading ? <span className="auth-spinner" /> : 'Register'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                Already a member?{' '}
                <span onClick={() => navigate('/auth')}
                  style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>
                  Login
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Terms and Conditions Modal ── */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2.2rem 2rem 2rem',
            position: 'relative',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            animation: 'modalSlideUp 0.3s ease-out-quad',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: 'var(--orange-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--orange)',
                }}>
                  <i className="fa-solid fa-file-shield" style={{ fontSize: '1.1rem' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Terms & Conditions
                </h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', fontSize: '1.2rem', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Content List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: '#475569', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>
                By signing up for the Mindcraft AI Club, you acknowledge and agree to the following:
              </p>

              {/* Term 1 */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-school" style={{ color: 'var(--orange)', marginTop: '0.25rem', fontSize: '0.9rem' }} />
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>College Records Sharing</strong>
                  <p style={{ margin: '0.1rem 0 0', color: '#64748b' }}>We will share your registered details and activities with the college administration for coordination and club performance tracking.</p>
                </div>
              </div>

              {/* Term 2 */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-microchip" style={{ color: 'var(--orange)', marginTop: '0.25rem', fontSize: '0.9rem' }} />
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>AI Model Training</strong>
                  <p style={{ margin: '0.1rem 0 0', color: '#64748b' }}>Your submitted details and participation work may be utilized to train and fine-tune AI models developed within club projects.</p>
                </div>
              </div>

              {/* Term 3 */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--orange)', marginTop: '0.25rem', fontSize: '0.9rem' }} />
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>Email & WhatsApp Notifications</strong>
                  <p style={{ margin: '0.1rem 0 0', color: '#64748b' }}>We will send announcements, project updates, and alerts directly to your registered email and WhatsApp phone number.</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setAgreed(true); setShowTermsModal(false); }} style={{
                flex: 1, background: 'var(--orange)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '0.65rem',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--orange-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--orange)'}
              >
                Accept & Agree
              </button>
              <button onClick={() => setShowTermsModal(false)} style={{
                background: '#f1f5f9', color: '#475569',
                border: 'none', borderRadius: '8px', padding: '0.65rem 1.2rem',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── global styles ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        .auth-form-scroll::-webkit-scrollbar { width: 4px; }
        .auth-form-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 8px; }
        .auth-form-scroll::-webkit-scrollbar-thumb:hover { background: var(--orange); }
        @media (max-width: 768px) {
          .auth-split-card {
            grid-template-columns: 1fr !important;
          }
          .auth-split-card > div:first-child {
            display: none !important;
          }
          .auth-form-scroll {
            padding: 2.5rem 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
