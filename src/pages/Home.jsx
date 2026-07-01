import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function CountUp({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(to / 60);
      const timer = setInterval(() => {
        start = Math.min(start + step, to);
        setVal(start);
        if (start >= to) clearInterval(timer);
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const FEATURES = [
  { icon: '🤖', title: 'Large Language Models', desc: 'Explore GPT, Gemini, LLaMA — fine-tuning, prompting, and RAG architectures.', backTitle: 'Core Topics', backItems: ['RAG Architectures', 'LoRA & QLoRA Fine-tuning', 'Vector DBs (Chroma, Pinecone)', 'LangChain & Agents'] },
  { icon: '👁️', title: 'Computer Vision', desc: 'Object detection, image classification, segmentation with PyTorch & OpenCV.', backTitle: 'Core Topics', backItems: ['YOLOv8 Object Detection', 'U-Net Image Segmentation', 'PyTorch & Torchvision', 'Custom CNN Architectures'] },
  { icon: '🔊', title: 'NLP & Speech AI', desc: 'Sentiment analysis, named entity recognition, and speech-to-text pipelines.', backTitle: 'Core Topics', backItems: ['Whisper Speech Recognition', 'Hugging Face Transformers', 'NER & POS Tagging', 'Seq2Seq Translation Models'] },
  { icon: '📊', title: 'Data Science & ML', desc: 'Scikit-learn, pandas, feature engineering, and model evaluation techniques.', backTitle: 'Core Topics', backItems: ['EDA & Feature Engineering', 'Ensemble Models (XGBoost)', 'Dimensionality Reduction (PCA)', 'Cross-Validation & Grid Search'] },
  { icon: '⚙️', title: 'MLOps & Deployment', desc: 'Docker, FastAPI, Hugging Face Spaces — ship your models to production.', backTitle: 'Core Topics', backItems: ['Docker Containerization', 'FastAPI Web Services', 'GitHub Actions CI/CD', 'Model Monitoring & Logging'] },
  { icon: '🧪', title: 'AI Research Projects', desc: 'Work on real IEEE-publishable research with faculty mentors and seniors.', backTitle: 'Core Topics', backItems: ['Academic Paper Drafting', 'Literature Review Syncs', 'Experimental Design', 'LaTeX Typesetting'] },
];

const MARQUEE_ITEMS = [
  '🤖 Large Language Models', '👁️ Computer Vision', '🔊 Speech AI',
  '📊 Data Science', '⚙️ MLOps', '🧠 Neural Networks',
  '🔬 Research Projects', '🏆 Weekly Sprints',
];





export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [stats, setStats] = useState([
    { value: 120, suffix: '+', label: 'Members', icon: '👥' },
    { value: 40, suffix: '+', label: 'Projects', icon: '🛠️' },
    { value: 18, suffix: '', label: 'Events', icon: '📅' },
    { value: 6, suffix: '', label: 'Awards', icon: '🏆' },
  ]);

  const [heroTextRef, heroTextVis] = useScrollReveal(0.05);
  const [heroVizRef, heroVizVis] = useScrollReveal(0.05);
  const [statsRef, statsVis] = useScrollReveal(0.2);
  const [featRef, featVis] = useScrollReveal(0.1);
  const [dashRef, dashVis] = useScrollReveal(0.1);
  const [ctaRef, ctaVis] = useScrollReveal(0.2);

  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    let reqId;
    let mouseX = 0;
    let mouseY = 0;
    let currentX1 = 0;
    let currentY1 = 0;
    let currentX2 = 0;
    let currentY2 = 0;

    const handleMouseMove = (e) => {
      // Get mouse position relative to center of screen
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };

    const updatePosition = () => {
      // Set target displacements (multipliers adjust the speed/strength of parallax)
      const targetX1 = mouseX * 0.04;
      const targetY1 = mouseY * 0.04;
      const targetX2 = mouseX * -0.02;
      const targetY2 = mouseY * -0.02;

      // Linear interpolation (lerp) for smooth easing
      currentX1 += (targetX1 - currentX1) * 0.06;
      currentY1 += (targetY1 - currentY1) * 0.06;
      currentX2 += (targetX2 - currentX2) * 0.06;
      currentY2 += (targetY2 - currentY2) * 0.06;

      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${currentX1}px, ${currentY1}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${currentX2}px, ${currentY2}px)`;
      }

      reqId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    reqId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const anns = await db.find('Announcements');
        setAnnouncements(anns.slice(0, 3));
        const evts = await db.find('Events');
        const today = new Date().toISOString().split('T')[0];
        const upcoming = evts.filter(e => e.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (upcoming.length > 0) setUpcomingEvent(upcoming[0]);
      } catch { /* ignore */ }
    })();
  }, []);



  const reveal = (vis, dir = 'up', delay = '0s') => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : dir === 'left' ? 'translateX(-50px)' : dir === 'right' ? 'translateX(50px)' : dir === 'scale' ? 'scale(0.88)' : 'translateY(40px)',
    transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}`,
  });

  return (
    <div style={{ overflowX: 'hidden' }}>
      <style>{`
        @keyframes float-chip { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes blob-drift { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.08) translate(20px,-15px)} }
        @keyframes marquee-ltr { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes ping-dot { 0%{transform:scale(1);opacity:.9} 100%{transform:scale(2.4);opacity:0} }
        @keyframes hero-glow { 0%,100%{opacity:0.12} 50%{opacity:0.22} }
      `}</style>

      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', padding: '5rem 0 3rem',
        background: 'linear-gradient(180deg, rgba(255,85,0,0.03) 0%, transparent 60%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Blob 1 Wrapper (Mouse Follow) */}
          <div ref={blob1Ref} style={{ position: 'absolute', inset: 0, transition: 'transform 0.1s ease-out' }}>
            <div style={{
              position: 'absolute', top: '5%', left: '25%',
              width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,107,53,0.14) 0%, transparent 60%)',
              filter: 'blur(80px)', animation: 'blob-drift 14s ease-in-out infinite',
            }} />
          </div>
          {/* Blob 2 Wrapper (Mouse Follow) */}
          <div ref={blob2Ref} style={{ position: 'absolute', inset: 0, transition: 'transform 0.1s ease-out' }}>
            <div style={{
              position: 'absolute', bottom: '-10%', right: '5%',
              width: 450, height: 450, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,61,127,0.09) 0%, transparent 60%)',
              filter: 'blur(70px)', animation: 'blob-drift 18s ease-in-out infinite reverse',
            }} />
          </div>
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', width: '100%', textAlign: 'center',
        }}>
          <div ref={heroTextRef} style={{ maxWidth: 680, ...reveal(heroTextVis, 'up') }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(var(--orange-rgb), 0.08)',
              border: '1px solid rgba(var(--orange-rgb), 0.2)',
              borderRadius: 50, padding: '0.4rem 1.1rem',
              fontSize: '0.75rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--orange)', marginBottom: '1.75rem',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--orange)', display: 'inline-block',
                animation: 'ping-dot 1.2s ease-out infinite',
              }} />
              CSE · AI Club · Recruiting 2026–27
            </div>

             <h1 style={{
              fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '2rem',
              color: 'var(--text)',
              letterSpacing: '-0.03em',
            }}>
              Build Real{' '}
              <span className="gradient-text" style={{
                fontWeight: 900,
                backgroundSize: '200% auto',
                animation: 'shimmer-text 3s linear infinite',
                display: 'inline-block',
              }}>
                AI Systems
              </span>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82em' }}>with CSE's Best</span>
            </h1>

            <p style={{
              fontSize: '1.05rem', color: 'var(--text-secondary)',
              lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 540, margin: '0 auto 2.5rem',
            }}>
              Mindcraft AI is the official AI club for CSE students. From LLMs to Computer Vision,
              we build real projects, and grow together.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem', justifyContent: 'center' }}>
              <Link to="/join" className="btn btn-primary" style={{ borderRadius: 14, fontSize: '0.98rem', padding: '0.85rem 2rem' }}>
                Join the Club <i className="fa-solid fa-arrow-right" />
              </Link>
              <Link to="/projects" className="btn btn-secondary" style={{ borderRadius: 14, fontSize: '0.98rem', padding: '0.85rem 2rem' }}>
                <i className="fa-solid fa-briefcase" /> View Projects
              </Link>
            </div>

            <div ref={statsRef} style={{
              display: 'flex', gap: '2rem', flexWrap: 'wrap',
              paddingTop: '2rem', justifyContent: 'center',
              borderTop: '1px solid var(--border-light)',
              ...reveal(statsVis, 'up', '0.2s'),
            }}>
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.9rem', fontWeight: 900,
                    fontFamily: 'var(--font-display)', lineHeight: 1,
                    color: 'var(--orange)',
                  }}>
                    {s.icon} <CountUp to={s.value} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>

      {/* MARQUEE */}
      <div style={{
        overflow: 'hidden', padding: '1rem 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        marginBottom: '5rem',
        background: 'linear-gradient(90deg, rgba(var(--orange-rgb),0.03), rgba(var(--orange-rgb),0.06), rgba(var(--orange-rgb),0.03))',
      }}>
        <div style={{ display: 'flex', gap: '3rem', animation: 'marquee-ltr 28s linear infinite', width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
              {item} <span style={{ color: 'var(--orange)', marginLeft: '0.8rem' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="section">
        <Reveal direction="up">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--orange)' }}>What We Build</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text)' }}>
              AI Skills for Real Impact
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.75rem', maxWidth: 520, margin: '0.75rem auto 0' }}>
              Every domain we work in is directly applicable to research papers, internships, and industry careers.
            </p>
          </div>

          <div className="grid-auto">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="flip-card">
                <div className="flip-card-inner">
                  {/* Front Side */}
                  <div className="flip-card-front">
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: 'rgba(var(--orange-rgb), 0.08)',
                      border: '1px solid rgba(var(--orange-rgb), 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', marginBottom: '1.1rem',
                    }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text)' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                  {/* Back Side */}
                  <div className="flip-card-back">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--orange)' }}>
                      {f.backTitle}
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {f.backItems.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* DASHBOARD BLOCKS */}
      <section ref={dashRef} style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem', marginBottom: '5rem', ...reveal(dashVis, 'up'),
      }}>
        <TiltCard tiltDegree={5}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '2rem',
            boxShadow: 'var(--shadow-md)', minHeight: 340, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', fontSize: '6rem', fontWeight: 900, opacity: 0.03, lineHeight: 1, pointerEvents: 'none', color: 'var(--orange)' }}>01</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              <span style={{ color: 'var(--orange)' }}>📢</span> Announcements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flexGrow: 1 }}>
              {announcements.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No active announcements.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} style={{ borderLeft: `2px solid ${ann.important ? 'var(--orange)' : 'var(--border)'}`, paddingLeft: '0.9rem' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: ann.important ? 'var(--orange)' : 'var(--text)' }}>
                      {ann.title}
                      {ann.important && <span style={{ fontSize: '0.6rem', background: 'rgba(var(--orange-rgb), 0.1)', border: '1px solid rgba(var(--orange-rgb), 0.25)', padding: '0.1rem 0.35rem', borderRadius: 4, marginLeft: '0.4rem', color: 'var(--orange)', verticalAlign: 'middle' }}>HOT</span>}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </TiltCard>

        <TiltCard tiltDegree={5}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '2rem',
            minHeight: 340, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', fontSize: '6rem', fontWeight: 900, opacity: 0.05, lineHeight: 1, color: 'var(--orange)', pointerEvents: 'none' }}>02</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              <span style={{ color: 'var(--orange)' }}>📅</span> Next Event
            </h3>
            {upcomingEvent ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                <div>
                  {upcomingEvent.poster && <img src={upcomingEvent.poster} alt={upcomingEvent.title} style={{ width: '100%', height: 140, objectFit: 'contain', borderRadius: 10, marginBottom: '0.9rem', background: 'var(--surface)', border: '1px solid var(--border)' }} />}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>{upcomingEvent.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{upcomingEvent.description?.substring(0, 90)}...</p>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 600, marginBottom: '0.9rem' }}>
                    <span>📍 {upcomingEvent.venue}</span>
                    <span>🕐 {upcomingEvent.date}</span>
                  </div>
                  <Link to="/events" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', borderRadius: 10 }}>
                    Register Now <i className="fa-solid fa-ticket" />
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                <p style={{ fontSize: '0.85rem' }}>No upcoming events yet.</p>
              </div>
            )}
          </div>
        </TiltCard>

        <TiltCard tiltDegree={5}>
          <div style={{
            background: 'linear-gradient(135deg, var(--orange), var(--orange-light))',
            borderRadius: 'var(--radius-lg)', padding: '2rem',
            minHeight: 340, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden', color: '#fff',
          }}>
            <div style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', fontSize: '6rem', fontWeight: 900, opacity: 0.12, lineHeight: 1, color: '#fff', pointerEvents: 'none' }}>03</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', fontWeight: 800, position: 'relative' }}>
              🚀 Ready to Build AI?
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.9, position: 'relative' }}>
              Join 120+ CSE students building LLMs, vision models, and AI tools. Applications for 2026–27 are now open.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: 'auto', position: 'relative' }}>
              <Link to="/join" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 12, padding: '0.7rem', fontWeight: 700, fontSize: '0.92rem',
                color: '#fff', textDecoration: 'none',
                transition: 'background var(--transition)',
              }}>
                Apply Now <i className="fa-solid fa-arrow-right" />
              </Link>
              <Link to="/resources" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.65rem',
                fontWeight: 600, fontSize: '0.85rem', color: '#fff', textDecoration: 'none',
              }}>
                <i className="fa-solid fa-book" /> Explore Resources
              </Link>
            </div>
          </div>
        </TiltCard>
      </section>





      {/* FINAL CTA */}
      <section ref={ctaRef} style={{
        position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        padding: '5rem 2.5rem', textAlign: 'center', marginBottom: '3rem',
        background: 'linear-gradient(135deg, rgba(var(--orange-rgb), 0.06) 0%, rgba(255,61,127,0.04) 50%, rgba(var(--orange-rgb), 0.06) 100%)',
        border: '1px solid rgba(var(--orange-rgb), 0.18)',
        boxShadow: '0 0 80px rgba(var(--orange-rgb), 0.08)',
        ...reveal(ctaVis, 'scale'),
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: 400, height: 300, background: 'radial-gradient(ellipse, rgba(var(--orange-rgb), 0.08), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(var(--orange-rgb), 0.05), transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontFamily: 'var(--font-display)', fontWeight: 900,
            marginBottom: '1rem', color: 'var(--text)', lineHeight: 1.1,
          }}>
            Shape the Future<br />
            <span className="gradient-text">of AI at CSE</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2.25rem', maxWidth: 480, margin: '0 auto 2.25rem', lineHeight: 1.75 }}>
            Applications are open. Join the club building the next generation of AI-powered solutions — right here in CSE.
          </p>
          <Link to="/join" className="btn btn-primary" style={{
            borderRadius: 14, fontSize: '1rem', padding: '0.95rem 2.5rem',
            boxShadow: '0 12px 30px rgba(var(--orange-rgb), 0.3)',
          }}>
            Apply Now <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </section>
    </div>
  );
}
