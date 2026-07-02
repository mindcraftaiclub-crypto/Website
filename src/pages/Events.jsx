import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';

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

  if (!timeLeft) return <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.82rem' }}>Started ✓</span>;

  return (
    <div style={{ display: 'flex', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700 }}>
      {timeLeft.days > 0 && <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#fff' }}>{timeLeft.days}d</span>}
      <span style={{ background: timeLeft.isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.15)', padding: '0.15rem 0.4rem', borderRadius: 4, color: timeLeft.isCritical ? '#f87171' : '#fff' }}>{timeLeft.hours}h</span>
      <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#fff' }}>{timeLeft.minutes}m</span>
      <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#fff' }}>{timeLeft.seconds}s</span>
    </div>
  );
}

const CATEGORY_MAP = {
  'evt_1': 'Seminars',
  'evt_2': 'Seminars',
  'evt_3': 'Workshops',
  'evt_4': 'Events',
  'evt_5': 'Coding Sprints',
  'evt_6': 'Workshops',
  'evt_7': 'Seminars'
};

const CATEGORIES = ['All', 'Seminars', 'Workshops', 'Events', 'Coding Sprints'];

export default function Events({ user }) {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('Events');
        const listWithCategories = list.map(evt => ({
          ...evt,
          category: CATEGORY_MAP[evt.id] || 'Events'
        }));
        setAllEvents(listWithCategories);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally { setLoading(false); }
    })();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const sortedEvents = [...allEvents].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredEvents = activeCategory === 'All'
    ? sortedEvents
    : sortedEvents.filter(evt => evt.category === activeCategory);

  const handleRegister = async (e, eventId) => {
    e.stopPropagation();
    if (!user) return navigate(`/auth?redirect=/events`);
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
    <div className="animated-entrance" style={{ position: 'relative', minHeight: '80vh' }}>
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-calendar-days"></i> Calendar</span>
        <h2 className="page-title">Events & Workshops</h2>
        <p className="page-subtitle">Stay updated with our workshops, seminars, coding sprints, and challenges throughout the year.</p>
      </div>

      {/* Category Pills (Pills style matching Gallery) */}
      <div className="filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`filter-tab-pill ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ margin: '4rem auto' }} />
      ) : (
        <motion.div 
          className="gallery-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } }
          }}
        >
          <AnimatePresence>
            {filteredEvents.map((evt) => {
              const isUpcoming = evt.date >= today;
              const isRegistered = evt.registeredUsers?.includes(user?.id);

              return (
                <motion.div
                  key={evt.id}
                  className="gallery-card"
                  variants={{
                    hidden: { opacity: 0, y: 35, scale: 0.97 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                >
                  {/* Event Poster Image */}
                  <img 
                    src={evt.poster} 
                    alt={evt.title} 
                    className="gallery-card-img"
                  />

                  {/* Glassmorphic Hover Overlay */}
                  <div className="gallery-card-overlay">
                    <span className="glass-badge">
                      {evt.category}
                    </span>

                    <h3 className="gallery-card-title">
                      {evt.title}
                    </h3>

                    <p style={{
                      fontSize: '0.78rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: '0 0 1rem 0',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {evt.description}
                    </p>

                    <div className="gallery-card-info" style={{ marginBottom: '1rem' }}>
                      <span>📍 {evt.venue.split('(')[0].trim()}</span>
                      <span>🕐 {evt.date}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {isUpcoming ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Starts in:</span>
                            <EventCountdown targetStr={`${evt.date}T${evt.time || '00:00'}`} />
                          </div>

                          <button 
                            onClick={(e) => handleRegister(e, evt.id)}
                            className="gallery-view-btn"
                          >
                            <i className={isRegistered ? "fa-solid fa-circle-check" : "fa-solid fa-user-plus"}></i> {isRegistered ? 'Registered ✓' : 'Register Now'}
                          </button>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>Past event</span>
                          <button disabled className="gallery-view-btn" style={{ width: 'auto', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed', boxShadow: 'none' }}>
                            Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📅</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.25rem' }}>No Events Scheduled</h3>
          <p style={{ fontSize: '0.88rem' }}>There are currently no scheduled events in this category.</p>
        </div>
      )}

      {/* Local styles inherited from Gallery page */}
      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 2rem;
          margin-top: 2.5rem;
          padding-bottom: 4rem;
        }
        .gallery-card {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
          cursor: pointer;
          background: var(--card);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: var(--shadow-xl);
          border-color: var(--orange);
        }
        .gallery-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-card:hover .gallery-card-img {
          transform: scale(1.05);
        }
        .gallery-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 17, 23, 0.95) 0%, rgba(15, 17, 23, 0.4) 60%, rgba(15, 17, 23, 0) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2.5rem 1.5rem 1.5rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .gallery-card:hover .gallery-card-overlay {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .glass-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          font-weight: 700;
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          align-self: flex-start;
          margin-bottom: 0.75rem;
        }
        .gallery-card-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 0.4rem;
          letter-spacing: -0.01em;
        }
        .gallery-card-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.25rem;
          font-weight: 500;
        }
        .gallery-card-info span {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .gallery-view-btn {
          width: 100%;
          background: var(--orange);
          color: #fff;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.82rem;
          text-align: center;
          transition: all 0.2s ease;
          border: none;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        }
        .gallery-view-btn:hover {
          background: var(--orange-light);
          transform: translateY(-1px);
        }
        .filter-tabs {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin: 3rem auto 1rem;
          max-width: 800px;
          padding: 0 1rem;
        }
        .filter-tab-pill {
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          background: var(--card);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .filter-tab-pill:hover {
          color: var(--orange);
          border-color: var(--orange);
          transform: translateY(-1px);
        }
        .filter-tab-pill.active {
          color: #fff;
          background: var(--orange);
          border-color: var(--orange);
          box-shadow: var(--shadow-brand);
        }
      `}</style>
    </div>
  );
}
