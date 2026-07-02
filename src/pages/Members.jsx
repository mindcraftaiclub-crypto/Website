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
    <div className="animated-entrance" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <span className="page-tag" style={{ justifyContent: 'center' }}><i className="fa-solid fa-users"></i> Board Members</span>
        <h2 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem' }}>Team Awesome</h2>
        <p className="page-subtitle" style={{ margin: '0.5rem auto 0', maxWidth: '600px' }}>Meet the visionaries, engineers, and designers directing Mindcraft AI.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
          {coreMembers.map((m, i) => {
            const isEven = i % 2 === 0;
            return (
              <Reveal key={m.id} direction="up" delay={`${i * 0.08}s`}>
                <div style={{
                  display: 'flex',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                  alignItems: 'center',
                  gap: '3rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }} className="team-row-container">
                  
                  {/* Left Side: Overlapping Image Portrait */}
                  <div style={{ position: 'relative', width: '220px', height: '260px', flexShrink: 0 }}>
                    {/* Artistic Orange background offset box */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: isEven ? '-15px' : '15px',
                      width: '100%',
                      height: '100%',
                      background: 'var(--orange)',
                      borderRadius: '8px',
                      zIndex: 0
                    }} />

                    {/* Grayscale Main Image container */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.18)',
                      zIndex: 1,
                      background: '#f3f4f6'
                    }}>
                      <img
                        src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`}
                        alt={m.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Side: Description and Social Links */}
                  <div style={{
                    flex: 1,
                    minWidth: '280px',
                    textAlign: isEven ? 'left' : 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isEven ? 'flex-start' : 'flex-end'
                  }} className="team-info-container">
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--text)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '0.25rem',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {m.name}
                    </h3>

                    <span style={{
                      fontSize: '0.9rem',
                      color: 'var(--orange)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '1rem',
                      display: 'block'
                    }}>
                      {m.role}
                    </span>

                    {/* Description Bio text */}
                    <p style={{
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      marginBottom: '1.25rem',
                      maxWidth: '520px'
                    }}>
                      {m.description || `${m.name} contributes to directing technology initiatives and organizing community workshops at Mindcraft AI.`}
                    </p>

                    {/* Small horizontal accent separator */}
                    <div style={{
                      width: '40px',
                      height: '2px',
                      background: 'var(--orange)',
                      marginBottom: '1.25rem'
                    }} />

                    {/* Social Media links */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank" rel="noreferrer" style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                          <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                      )}
                      {m.instagram && (
                        <a href={m.instagram} target="_blank" rel="noreferrer" style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                      )}
                      {m.github && (
                        <a href={m.github} target="_blank" rel="noreferrer" style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                          <i className="fa-brands fa-github"></i>
                        </a>
                      )}
                      {m.portfolio && (
                        <a href={m.portfolio} target="_blank" rel="noreferrer" style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
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
            );
          })}
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
