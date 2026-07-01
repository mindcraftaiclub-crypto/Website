import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('Projects');
        setProjects(list);
        setFilteredProjects(list);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(p => {
      const matchFilter = activeFilter === 'all' || p.status === activeFilter;
      const matchSearch = !searchVal || p.title.toLowerCase().includes(searchVal.toLowerCase()) || p.description.toLowerCase().includes(searchVal.toLowerCase()) || p.tech?.some(t => t.toLowerCase().includes(searchVal.toLowerCase()));
      return matchFilter && matchSearch;
    });
    setFilteredProjects(filtered);
  }, [activeFilter, searchVal, projects]);

  const statuses = ['all', 'Completed', 'In Progress', 'Planning'];

  return (
    <div className="animated-entrance">
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-briefcase"></i> Showcase</span>
        <h2 className="page-title">Innovations & Projects</h2>
        <p className="page-subtitle">Explore the bleeding-edge web platforms, embedded modules, and utility software crafted by the developers at Mindcraft AI.</p>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          {statuses.map(s => (
            <button key={s} className={`btn btn-sm ${activeFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveFilter(s)} style={{ borderRadius: 'var(--radius-sm)' }}>
              {s === 'all' ? 'All Work' : s}
            </button>
          ))}
        </div>
        <input className="form-input" placeholder="Search projects..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} style={{ width: 220, padding: '0.45rem 0.8rem', fontSize: '0.85rem' }} />
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div className="grid-auto">
          {filteredProjects.map((p, i) => (
            <Reveal key={p.id} direction="up" delay={`${i * 0.06}s`}>
              <TiltCard tiltDegree={6} scale={1.02}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column',
                }}>
                  {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{p.title}</h3>
                      {p.status && <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 50, background: p.status === 'Completed' ? 'rgba(22,163,74,0.1)' : p.status === 'In Progress' ? 'rgba(var(--orange-rgb),0.1)' : 'rgba(99,102,241,0.1)', color: p.status === 'Completed' ? '#16a34a' : p.status === 'In Progress' ? 'var(--orange)' : '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.status}</span>}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>{p.description}</p>
                    {p.tech && p.tech.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {p.tech.map((t, j) => <span key={j} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(var(--orange-rgb), 0.06)', borderRadius: 4, color: 'var(--text-secondary)', fontWeight: 600 }}>{t}</span>)}
                      </div>
                    )}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--orange)', fontWeight: 600 }}>
                        <i className="fa-solid fa-external-link"></i> View Project
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
          <p>No projects match your criteria.</p>
        </div>
      )}
    </div>
  );
}
