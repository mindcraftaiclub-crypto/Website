import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';
import workingUrls from '../../working_gallery_urls.json';

export default function Gallery() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const EVENT_NAMES = {
          'event1': 'Mind of Machines Keynote',
          'event2': 'Data Preprocessing Seminar',
          'event3': 'n8n Workflow Automation',
          'event4': 'Plot to Bot Event',
          'event5': 'Vibe Coding Sprint',
          'event6': 'API Alchemy Workshop',
          'event7': 'DeployX Hybrid Seminar'
        };

        const list = await db.find('Events');
        
        // Map events to their respective snapshots from workingUrls
        const eventsWithSnaps = list.map(evt => {
          const eventNum = evt.id.split('_')[1]; // e.g. '1' from 'evt_1'
          const folderKey = `event${eventNum}`;
          
          // Get all snapshots for this event folder
          const snapshots = Object.entries(workingUrls)
            .filter(([localPath]) => localPath.startsWith(`/gallery/${folderKey}/`))
            .map(([_, supabaseUrl]) => supabaseUrl);

          return {
            ...evt,
            folderKey,
            snapshots
          };
        })
        // Sort by date descending
        .sort((a, b) => new Date(b.date) - new Date(a.date));

        setEvents(eventsWithSnaps);
      } catch (err) {
        console.error("Error loading gallery events:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animated-entrance" style={{ position: 'relative', minHeight: '80vh' }}>
      <style>{`
        .fullscreen-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: var(--bg);
          overflow-y: auto;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--orange);
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          cursor: pointer;
          transition: transform 0.2s ease;
          border: none;
          background: none;
          padding: 0;
          align-self: flex-start;
        }
        .back-btn:hover {
          transform: translateX(-4px);
        }
        .fullscreen-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
          padding-bottom: 4rem;
        }
        .fullscreen-img-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          cursor: zoom-in;
          border: 1px solid var(--border-light);
          background: var(--card);
          aspect-ratio: 4/3;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fullscreen-img-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--orange);
        }
        .lightbox-top-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
        }
      `}</style>

      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-image"></i> Gallery</span>
        <h2 className="page-title">Moments & Memories</h2>
        <p className="page-subtitle">Select an event poster below to view all the captured snapshots in a full-screen layout.</p>
      </div>

      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <motion.div 
          className="grid-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
        >
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              variants={{
                hidden: { opacity: 0, y: 35, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
              }}
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              onClick={() => setSelectedEvent(evt)}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Event Poster Card */}
              <div style={{ overflow: 'hidden', height: 280, background: 'var(--surface)', position: 'relative' }}>
                <img 
                  src={evt.poster} 
                  alt={evt.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transition: 'transform 0.4s ease' }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }} />
              </div>
              <div style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--orange)' }}>
                  {evt.venue}
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text)' }}>
                  {evt.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕐 {evt.date}</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(var(--orange-rgb), 0.08)', color: 'var(--orange)', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 700 }}>
                    {evt.snapshots?.length || 0} Snaps
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Full Screen Images Viewer Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            className="fullscreen-overlay"
            initial={{ opacity: 0, y: '30px' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '30px' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header / Back Action */}
            <button className="back-btn" onClick={() => setSelectedEvent(null)}>
              <i className="fa-solid fa-arrow-left" /> Back to Gallery
            </button>

            {/* Event Header Details */}
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--orange)' }}>
                Viewing Event Snaps
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {selectedEvent.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
                <span>📍 Venue: {selectedEvent.venue}</span>
                <span>🕐 Date: {selectedEvent.date}</span>
                <span>📸 Snapshots: {selectedEvent.snapshots?.length || 0} items</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.65, maxWidth: '800px' }}>
                {selectedEvent.description}
              </p>
            </div>

            {/* Grid of Snaps */}
            {selectedEvent.snapshots && selectedEvent.snapshots.length > 0 ? (
              <motion.div 
                className="fullscreen-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } }
                }}
              >
                {selectedEvent.snapshots.map((url, idx) => (
                  <motion.div 
                    key={idx}
                    className="fullscreen-img-card"
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    onClick={() => setLightboxUrl(url)}
                  >
                    <img 
                      src={url} 
                      alt="Event snapshot memory" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} 
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No snaps found</h3>
                <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>No snapshots are currently uploaded for this event.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Zoom Viewer */}
      <AnimatePresence>
        {lightboxUrl && (
          <div className="lightbox-top-overlay" onClick={() => setLightboxUrl(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{ position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="lightbox-close" 
                onClick={() => setLightboxUrl(null)}
                style={{ top: '-3rem', right: '0', background: 'rgba(255,255,255,0.1)', border: 'none' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <img 
                src={lightboxUrl} 
                alt="High Res Snapshot" 
                style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
