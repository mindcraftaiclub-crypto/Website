import React, { useState, useEffect } from 'react';
import db from '../db';
import Reveal from '../components/Reveal';

export default function Members() {
  const [coreMembers, setCoreMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('CoreMembers');
        setCoreMembers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animated-entrance" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="page-tag" style={{ justifyContent: 'center' }}><i className="fa-solid fa-users"></i> Board Members</span>
        <h2 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem' }}>Team Awesome</h2>
        <p className="page-subtitle" style={{ margin: '0.5rem auto 0', maxWidth: '600px' }}>Meet the visionaries, engineers, and designers directing Mindcraft AI.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem 0.5rem', // Small gap between cards to let orange banners merge almost continuously
          justifyContent: 'center',
          alignItems: 'start'
        }}>
          {coreMembers.map((m, i) => (
            <Reveal key={m.id} direction="up" delay={`${i * 0.08}s`}>
              <div style={{
                position: 'relative',
                textAlign: 'center',
                paddingBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Horizontal Orange Banner Segment inside the card */}
                <div style={{
                  position: 'absolute',
                  top: '80px',
                  left: 0,
                  right: 0,
                  height: '110px',
                  background: 'var(--orange)',
                  zIndex: 0
                }} />

                {/* Overlapping Portrait Image */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '180px',
                  height: '210px',
                  overflow: 'hidden',
                  borderRadius: '6px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                  marginBottom: '1.5rem',
                  background: '#f3f4f6'
                }}>
                  <img
                    src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`}
                    alt={m.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'grayscale(100%) contrast(1.05)',
                      transition: 'all 0.4s ease'
                    }}
                    className="team-member-portrait"
                    onMouseEnter={e => {
                      e.currentTarget.style.filter = 'grayscale(0%) contrast(1)';
                      e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.filter = 'grayscale(100%) contrast(1.05)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>

                {/* Text details below the banner */}
                <div style={{ position: 'relative', zIndex: 1, padding: '0 1rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.35rem',
                    fontFamily: 'var(--font-display)'
                  }}>
                    {m.name}
                  </h3>
                  
                  <span style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 400,
                    display: 'block',
                    marginBottom: '0.75rem'
                  }}>
                    {m.role}
                  </span>

                  {/* Accent Line */}
                  <div style={{
                    width: '32px',
                    height: '2px',
                    background: 'var(--orange)',
                    margin: '0 auto 1.25rem'
                  }} />

                  {/* Circular Social Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                      >
                        <i className="fa-brands fa-linkedin-in"></i>
                      </a>
                    )}
                    {m.instagram && (
                      <a href={m.instagram} target="_blank" rel="noreferrer" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                      >
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                    )}
                    {m.github && (
                      <a href={m.github} target="_blank" rel="noreferrer" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                      >
                        <i className="fa-brands fa-github"></i>
                      </a>
                    )}
                    {m.portfolio && (
                      <a href={m.portfolio} target="_blank" rel="noreferrer" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                      >
                        <i className="fa-solid fa-globe"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {(!loading && coreMembers.length === 0) && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
          <p>No core members registered yet.</p>
        </div>
      )}
    </div>
  );
}
