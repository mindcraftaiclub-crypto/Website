import { useState, useEffect } from 'react';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

const CATEGORY_ICONS = {
  'PPT': 'fa-file-powerpoint',
  'PDF': 'fa-file-pdf',
  'GitHub Links': 'fa-github',
  'Videos': 'fa-video',
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('Resources');
        setResources(list);
        setFilteredResources(list);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const filtered = resources.filter(res => {
      const matchFilter = activeFilter === 'all' || res.category === activeFilter;
      const matchSearch = !searchVal || res.title.toLowerCase().includes(searchVal.toLowerCase()) || res.description.toLowerCase().includes(searchVal.toLowerCase());
      return matchFilter && matchSearch;
    });
    setFilteredResources(filtered);
  }, [activeFilter, searchVal, resources]);

  const categories = ['all', ...new Set(resources.map(r => r.category))];

  return (
    <div className="animated-entrance">
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-book"></i> Library</span>
        <h2 className="page-title">Resources & Materials</h2>
        <p className="page-subtitle">Curated learning materials, slide decks, code repositories, and video recordings from our sessions.</p>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          {categories.map(c => (
            <button key={c} className={`btn btn-sm ${activeFilter === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveFilter(c)} style={{ borderRadius: 'var(--radius-sm)' }}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <input className="form-input" placeholder="Search resources..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} style={{ width: 220, padding: '0.45rem 0.8rem', fontSize: '0.85rem' }} />
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div className="grid-auto">
          {filteredResources.map((res, i) => (
            <Reveal key={res.id} direction="up" delay={`${i * 0.06}s`}>
              <TiltCard tiltDegree={6} scale={1.02}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)', height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(var(--orange-rgb), 0.08)',
                      border: '1px solid rgba(var(--orange-rgb), 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', color: 'var(--orange)', flexShrink: 0,
                    }}>
                      <i className={`fa-solid ${CATEGORY_ICONS[res.category] || 'fa-file'}`}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.15rem' }}>{res.title}</h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{res.category}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>{res.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    {res.size && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{res.size}</span>}
                    <a href={res.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <i className="fa-solid fa-download"></i> Access
                    </a>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {!loading && filteredResources.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
          <p>No resources match your search.</p>
        </div>
      )}
    </div>
  );
}
