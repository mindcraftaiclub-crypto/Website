import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';
import workingUrls from '../../working_gallery_urls.json';

export default function Gallery() {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
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
        
        const CATEGORIES = {
          'evt_1': 'Seminars',
          'evt_2': 'Seminars',
          'evt_3': 'Workshops',
          'evt_4': 'Events',
          'evt_5': 'Coding Sprints',
          'evt_6': 'Workshops',
          'evt_7': 'Seminars'
        };

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
            snapshots,
            category: CATEGORIES[evt.id] || 'Events'
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

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(evt => evt.category === activeCategory);

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
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
          padding-bottom: 4rem;
        }
        @media (max-width: 1024px) {
          .fullscreen-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .fullscreen-grid {
            grid-template-columns: 1fr;
          }
        }
        .fullscreen-img-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          cursor: zoom-in;
          border: 1px solid var(--border-light);
          background: var(--card);
          height: 250px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fullscreen-img-card.span-2 {
          grid-column: span 2;
        }
        @media (max-width: 640px) {
          .fullscreen-img-card.span-2 {
            grid-column: span 1;
          }
        }
        .fullscreen-img-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--orange);
        }
        .snap-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.1) 40%, transparent 100%);
          display: flex;
          align-items: flex-end;
          padding: 1.25rem;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .fullscreen-img-card:hover .snap-card-overlay {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%);
        }
        .snap-card-label {
          color: #fff;
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
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
        
        /* Subframe Gallery Styles */
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
          border-color: var(--orange);
          color: var(--orange);
          transform: translateY(-1px);
        }
        .filter-tab-pill.active {
          background: var(--orange);
          border-color: var(--orange);
          color: #fff;
          box-shadow: var(--shadow-brand);
        }
      `}</style>

      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-image"></i> Gallery</span>
        <h2 className="page-title">Moments & Memories</h2>
        <p className="page-subtitle">Select an event poster below to view all the captured snapshots in a full-screen layout.</p>
      </div>

      {/* Filter Tabs Pills */}
      <div className="filter-tabs">
        {['All', 'Workshops', 'Seminars', 'Events', 'Coding Sprints'].map(cat => (
          <button
            key={cat}
            className={`filter-tab-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner" />
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
          {filteredEvents.map((evt) => (
            <motion.div
              key={evt.id}
              className="gallery-card"
              variants={{
                hidden: { opacity: 0, y: 35, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
              }}
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              onClick={() => setSelectedEvent(evt)}
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

                <div className="gallery-card-info">
                  <span>📍 {evt.venue.split('(')[0].trim()}</span>
                  <span>🕐 {evt.date}</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(evt);
                  }}
                  className="gallery-view-btn"
                >
                  <i className="fa-solid fa-images"></i> View Snaps ({evt.snapshots?.length || 0})
                </button>
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
              (() => {
                const displayedSnaps = selectedEvent.snapshots;
                return (
                  <motion.div 
                    className="fullscreen-grid"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.04 } }
                    }}
                  >
                    {displayedSnaps.map((url, idx) => {
                      const isSpan2 = idx % 6 === 1 || idx % 6 === 3;
                      return (
                        <motion.div 
                          key={idx}
                          className={`fullscreen-img-card ${isSpan2 ? 'span-2' : ''}`}
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
                          {/* Snap Overlay and Label */}
                          <div className="snap-card-overlay">
                            <span className="snap-card-label">
                              Snap #{(idx + 1).toString().padStart(2, '0')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                );
              })()
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
