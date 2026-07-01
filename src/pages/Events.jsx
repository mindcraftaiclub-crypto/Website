import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

function EventCountdown({ targetStr }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const targetDate = new Date(targetStr).getTime();
    const calculateTime = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) { setTimeLeft(null); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, isCritical: diff < (1000 * 60 * 60 * 24) });
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetStr]);

  if (!timeLeft) return <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>Event started ✓</span>;

  return (
    <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
      {timeLeft.days > 0 && <span style={{ background: 'rgba(var(--orange-rgb),0.1)', padding: '0.2rem 0.5rem', borderRadius: 6, color: 'var(--orange)' }}>{timeLeft.days}d</span>}
      <span style={{ background: timeLeft.isCritical ? 'rgba(220,38,38,0.1)' : 'rgba(var(--orange-rgb),0.1)', padding: '0.2rem 0.5rem', borderRadius: 6, color: timeLeft.isCritical ? '#dc2626' : 'var(--orange)' }}>{timeLeft.hours}h</span>
      <span style={{ background: 'rgba(var(--orange-rgb),0.1)', padding: '0.2rem 0.5rem', borderRadius: 6, color: 'var(--orange)' }}>{timeLeft.minutes}m</span>
      <span style={{ background: 'rgba(var(--orange-rgb),0.1)', padding: '0.2rem 0.5rem', borderRadius: 6, color: 'var(--orange)' }}>{timeLeft.seconds}s</span>
    </div>
  );
}

export default function Events({ user }) {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('Events');
        setAllEvents(list);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const displayEvents = [...allEvents].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleRegister = async (eventId) => {
    if (!user) return navigate('/auth?redirect=/events');
    try {
      const evt = allEvents.find(e => e.id === eventId);
      if (evt.registeredUsers?.includes(user.id)) {
        window.showToast('Already Registered', 'You are already on the list for this event.', 'info');
        return;
      }
      const updated = [...(evt.registeredUsers || []), user.id];
      await db.update('Events', eventId, { registeredUsers: updated });
      setAllEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredUsers: updated } : e));
      window.showToast('Registered!', 'You have been registered for this event.', 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="animated-entrance">
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-calendar-days"></i> Calendar</span>
        <h2 className="page-title">Events & Workshops</h2>
        <p className="page-subtitle">Stay updated with our workshops, seminars, coding sprints, and challenges throughout the year.</p>
      </div>

      <div className="filter-bar" style={{ justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{displayEvents.length} event{displayEvents.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div className="grid-auto">
          {displayEvents.map((evt, i) => {
            const isUpcoming = evt.date >= today;
            return (
              <Reveal key={evt.id} direction="up" delay={`${i * 0.06}s`}>
                <TiltCard tiltDegree={6} scale={1.02}>
                  <div style={{
                    background: 'var(--card)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column',
                  }}>
                    {evt.poster && <img src={evt.poster} alt={evt.title} style={{ width: '100%', height: 260, objectFit: 'contain', background: 'var(--surface)', borderBottom: '1px solid var(--border-light)' }} />}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>{evt.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>{evt.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        <span>📍 {evt.venue}</span>
                        <span>🕐 {evt.date}</span>
                      </div>
                      {isUpcoming ? (
                        <>
                          <EventCountdown targetStr={`${evt.date}T${evt.time || '00:00'}`} />
                          <button className="btn btn-primary btn-sm" onClick={() => handleRegister(evt.id)} style={{ marginTop: '0.75rem', justifyContent: 'center', width: '100%', borderRadius: 'var(--radius-sm)' }}>
                            {evt.registeredUsers?.includes(user?.id) ? '✅ Registered' : 'Register Now'}
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>Past event</span>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      )}

      {!loading && displayEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
          <p>No events scheduled.</p>
        </div>
      )}
    </div>
  );
}
