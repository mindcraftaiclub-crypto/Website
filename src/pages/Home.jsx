import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import db from '../db';

const MARQUEE_ITEMS = [
  '🤖 Large Language Models', '👁️ Computer Vision', '🔊 NLP & Speech AI',
  '📊 Data Science', '⚙️ MLOps', '🧠 Neural Networks',
  '🔬 Research Projects', '🏆 Weekly Sprints',
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const heroTextRef = useRef(null);
  const [heroTextVisible, setHeroTextVisible] = useState(false);

  useEffect(() => {
    // Simple intersection observer for hero entry
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeroTextVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    if (heroTextRef.current) obs.observe(heroTextRef.current);

    // Fetch current user session
    const session = db.getCurrentUser();
    setCurrentUser(session);

    return () => obs.disconnect();
  }, []);

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    window.showToast('Logged Out', 'Successfully logged out.', 'info');
  };

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)`,
  });

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr { 
          from { transform: translateX(0); } 
          to { transform: translateX(-50%); } 
        }
        .landing-header-link {
          color: rgba(15, 17, 23, 0.7);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
          padding: 0.25rem 0;
        }
        .landing-header-link:hover {
          color: var(--orange);
        }
        .landing-header-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--orange);
          transition: width 0.2s ease;
        }
        .landing-header-link:hover::after {
          width: 100%;
        }

        /* ── RESPONSIVE CLASSES ── */
        .hero-section-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 3.5rem 3.5rem 3.5rem;
          overflow: hidden;
          background: #ffffff;
        }
        .shard-tl {
          position: absolute; top: 0; left: 0;
          width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%);
          z-index: 0;
        }
        .shard-br {
          position: absolute; bottom: 0; right: 0;
          width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%);
          z-index: 0;
        }
        .hero-logo-circle {
          border-radius: 50%;
          width: 360px;
          height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 20px;
          box-sizing: border-box;
          background: #000000;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          position: relative;
          z-index: 1;
        }
        .hero-logo-img {
          width: 280px;
          height: 280px;
          object-fit: contain;
        }
        .hero-text-col {
          flex: 1.1;
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-cursive-tag {
          font-family: 'Dancing Script', cursive;
          font-size: 2.8rem;
          color: var(--orange);
          margin: 0 0 0.2rem 0;
          line-height: 1.1;
          text-shadow: 0 0 15px rgba(255, 85, 0, 0.15);
        }
        .hero-buttons-container {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .hero-split-container {
            flex-direction: column !important;
            text-align: center !important;
            gap: 2.5rem !important;
            padding: 0 1rem !important;
          }
          .hero-split-container > div {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-text-col {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-buttons-container {
            justify-content: center !important;
          }
        }

        @media (max-width: 600px) {
          .hero-section-container {
            padding: 6.5rem 1.5rem 4rem 1.5rem !important;
            min-height: auto !important;
          }
          .shard-tl {
            width: 180px !important;
            height: 180px !important;
          }
          .shard-br {
            width: 220px !important;
            height: 220px !important;
          }
          .hero-logo-circle {
            width: 260px !important;
            height: 260px !important;
          }
          .hero-logo-img {
            width: 190px !important;
            height: 190px !important;
          }
          .hero-cursive-tag {
            font-size: 2rem !important;
          }
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="hero-section-container">
        {/* Geometric shards */}
        <div className="shard-tl" />
        <div className="shard-br" />

        {/* 50/50 Split Screen Layout Container */}
        <div ref={heroTextRef} style={{
          maxWidth: '1200px', width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3rem',
          position: 'relative', zIndex: 1, ...reveal(heroTextVisible)
        }} className="hero-split-container">
          
          {/* LEFT SIDE: Stable Brain Logo inside black circle */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Circle logo wrapper */}
            <div className="hero-logo-circle">
              {/* Logo Image */}
              <img src="/logo.png" alt="Mindcraft AI Logo" className="hero-logo-img" />
            </div>
          </div>

          {/* RIGHT SIDE: Wordings */}
          <div className="hero-text-col">
            {/* Tagline Cursive tag */}
            <p className="hero-cursive-tag">
              Welcome to
            </p>

            {/* Main Title (bold, uppercase, italicized) */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.5rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              margin: '0 0 0.8rem 0',
              lineHeight: 1.05,
              color: '#0f1117',
            }}>
              Mindcraft AI Club
            </h1>

            <p style={{
              fontSize: '1.02rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginBottom: '1.75rem',
              maxWidth: '540px',
              margin: '0 0 1.75rem 0'
            }}>
              Mindcraft AI is the premier CSE student community. From Large Language Models to Computer Vision, we build real-world systems, host bootcamps, and launch products.
            </p>

            {/* Buttons */}
            <div className="hero-buttons-container">
              <Link to="/signup" className="btn btn-primary" style={{ borderRadius: 12, padding: '0.8rem 2.2rem', fontSize: '0.95rem' }}>
                Join the Club <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.45rem' }} />
              </Link>
              <Link to="/projects" className="btn btn-secondary" style={{ borderRadius: 12, padding: '0.8rem 2.2rem', fontSize: '0.95rem', color: 'var(--text)', border: '1px solid var(--border)' }}>
                Explore Sprints
              </Link>
            </div>
          </div>
        </div>

        {/* Slider dots indicator bottom left */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '3.5rem',
          display: 'flex', gap: '0.6rem', zIndex: 10
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--orange)' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(15,17,23,0.3)' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(15,17,23,0.3)' }} />
        </div>

        {/* Social media links bottom right (floating above the orange shard) */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', right: '3.5rem',
          display: 'flex', gap: '1.25rem', zIndex: 10, fontSize: '0.95rem'
        }}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-github" />
          </a>
          <a href="https://www.linkedin.com/company/mindcraft-ai-vcet" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-linkedin" />
          </a>
          <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-whatsapp" />
          </a>
        </div>
      </section>

      {/* ── MARQUEE TRANSITION ── */}
      <div style={{
        overflow: 'hidden', padding: '1.25rem 0',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(255, 85, 0, 0.02)',
      }}>
        <div style={{ display: 'flex', gap: '3.5rem', animation: 'marquee-ltr 30s linear infinite', width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {item} <span style={{ color: 'var(--orange)', opacity: 0.6 }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        padding: '3rem 2rem',
        background: 'var(--bg-2)',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontWeight: 700 }}>
            <img src="/logo.png" alt="Logo" style={{ height: '22px' }} />
            <span>MINDCRAFT AI</span>
          </div>
          <p style={{ margin: 0 }}>© 2026 Mindcraft AI Club. Developed by CSE Department.</p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <Link to="/members" style={{ color: 'inherit', textDecoration: 'none' }}>Members</Link>
            <Link to="/projects" style={{ color: 'inherit', textDecoration: 'none' }}>Projects</Link>
            <Link to="/gallery" style={{ color: 'inherit', textDecoration: 'none' }}>Gallery</Link>
            <Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
