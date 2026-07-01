import { useState, useEffect } from 'react';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

export default function Winners() {
  const [winners, setWinners] = useState([]);
  const [modal, setModal] = useState({ active: false, name: '', achievement: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('WeeklyWinners');
        setWinners(list);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const openCert = (name, achievement) => setModal({ active: true, name, achievement });
  const closeCert = () => setModal({ active: false, name: '', achievement: '' });

  return (
    <div className="animated-entrance">
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-trophy"></i> Achievements</span>
        <h2 className="page-title">Weekly Winners</h2>
        <p className="page-subtitle">Celebrating the top performers in our weekly coding challenges and sprint competitions.</p>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {winners.map((w, i) => (
            <Reveal key={w.id} direction="up" delay={`${i * 0.08}s`}>
              <TiltCard tiltDegree={6} scale={1.02}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden', textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
                    <img src={w.photo} alt={w.name} style={{
                      width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                      border: '3px solid rgba(var(--orange-rgb), 0.2)',
                      marginBottom: '0.75rem', boxShadow: '0 0 20px rgba(var(--orange-rgb), 0.15)',
                    }} />
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{w.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>{w.achievement}</p>
                    {w.certificate && (
                      <button className="btn btn-outline btn-sm" onClick={() => openCert(w.name, w.achievement)} style={{ borderRadius: 'var(--radius-sm)' }}>
                        <i className="fa-solid fa-certificate"></i> View Certificate
                      </button>
                    )}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {modal.active && (
        <div className="lightbox-overlay" onClick={closeCert}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            padding: '2.5rem', maxWidth: 420, width: '90%', textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Certificate of Achievement</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Presented to</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>{modal.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{modal.achievement}</p>
            <button className="btn btn-primary" onClick={closeCert} style={{ marginTop: '1.5rem', borderRadius: 'var(--radius-md)' }}>Close</button>
          </div>
        </div>
      )}

      {!loading && winners.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <p>No winners announced yet. Check back after the next sprint!</p>
        </div>
      )}
    </div>
  );
}
