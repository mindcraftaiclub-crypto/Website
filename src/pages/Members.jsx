import React, { useState, useEffect } from 'react';
import db from '../db';
import TiltCard from '../components/TiltCard';
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
    <div className="animated-entrance">
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-users"></i> Board Members</span>
        <h2 className="page-title">Core Board</h2>
        <p className="page-subtitle">Meet the visionaries, engineers, and designers directing Mindcraft AI.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {coreMembers.map((m, i) => (
            <Reveal key={m.id} direction="up" delay={`${i * 0.05}s`}>
              <TiltCard tiltDegree={5} scale={1.03}>
                <div className="card" style={{
                  background: 'var(--card)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem',
                  textAlign: 'center', boxShadow: 'var(--shadow-md)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  position: 'relative', overflow: 'hidden', height: '100%'
                }}>
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    overflow: 'hidden', border: '3px solid var(--orange)',
                    marginBottom: '1rem', boxShadow: 'var(--shadow-sm)'
                  }}>
                    <img src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{m.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--orange)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{m.role}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Year {m.year || 1} &bull; Computer Science</span>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: 'auto', width: '100%' }}>
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" className="social-link-btn" title="LinkedIn" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }}><i className="fa-brands fa-linkedin"></i></a>}
                    {m.instagram && <a href={m.instagram} target="_blank" rel="noreferrer" className="social-link-btn" title="Instagram" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }}><i className="fa-brands fa-instagram"></i></a>}
                    {m.github && <a href={m.github} target="_blank" rel="noreferrer" className="social-link-btn" title="GitHub" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }}><i className="fa-brands fa-github"></i></a>}
                    {m.portfolio && <a href={m.portfolio} target="_blank" rel="noreferrer" className="social-link-btn" title="Portfolio" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }}><i className="fa-solid fa-globe"></i></a>}
                  </div>
                </div>
              </TiltCard>
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
