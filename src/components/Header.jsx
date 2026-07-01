import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import db from '../db';

export default function Header({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [pendingNotifs, setPendingNotifs] = useState(0);
  const profileRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get('search') || '');
  }, [location]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const reqs = await db.find('JoinRequests');
        setPendingNotifs(reqs.filter(r => r.status === 'Pending').length);
      } catch { /* ignore */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      const query = searchValue.trim();
      navigate(query ? `/projects?search=${encodeURIComponent(query)}` : '/projects');
      setIsMobileOpen(false);
      setIsMoreOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await db.logout();
      window.showToast('Logged Out', 'You have been safely logged out.', 'info');
      setIsProfileOpen(false);
      navigate('/');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/members', label: 'Members', icon: 'fa-users' },
    { to: '/projects', label: 'Projects', icon: 'fa-briefcase' },
    { to: '/gallery', label: 'Gallery', icon: 'fa-image' },
    { to: '/events', label: 'Events', icon: 'fa-calendar-days' },
    { to: '/resources', label: 'Resources', icon: 'fa-book' },
    { to: '/quiz', label: 'Quiz', icon: 'fa-brain' },
    { to: '/tasks', label: 'Tasks', icon: 'fa-square-check' },
    { to: '/winners', label: 'Winners', icon: 'fa-trophy' },
    ...(!user ? [{ to: '/join', label: 'Join', icon: 'fa-hand-fist' }] : []),
    { to: '/contact', label: 'Contact', icon: 'fa-phone' },
  ];

  const primaryNavItems = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/members', label: 'Members', icon: 'fa-users' },
    { to: '/projects', label: 'Projects', icon: 'fa-briefcase' },
    { to: '/events', label: 'Events', icon: 'fa-calendar-days' },
    ...(!user ? [{ to: '/join', label: 'Join', icon: 'fa-hand-fist' }] : []),
    { to: '/contact', label: 'Contact', icon: 'fa-phone' },
  ];

  const exploreNavItems = [
    { to: '/gallery', label: 'Gallery', icon: 'fa-image' },
    { to: '/resources', label: 'Resources', icon: 'fa-book' },
    { to: '/quiz', label: 'Quiz', icon: 'fa-brain' },
    { to: '/tasks', label: 'Tasks', icon: 'fa-square-check' },
    { to: '/winners', label: 'Winners', icon: 'fa-trophy' },
  ];

  return (
    <header className="site-header">
      <Link to="/" className="header-logo" onClick={() => setIsMobileOpen(false)}>
        <span className="logo-dot"></span> <span>MINDCRAFT AI</span>
      </Link>

      <nav className="nav-menu-desktop">
        {primaryNavItems.map((item) => (
          <li key={item.to} className="nav-item-top">
            <NavLink to={item.to} className={({ isActive }) => `nav-link-top ${isActive ? 'active' : ''}`}>
              <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
            </NavLink>
          </li>
        ))}

        <div className="more-dropdown-container" ref={moreRef}>
          <button className={`nav-link-top more-trigger ${isMoreOpen ? 'active' : ''}`} onClick={() => setIsMoreOpen(prev => !prev)}>
            <i className="fa-solid fa-cubes"></i> <span>Explore</span> <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', marginLeft: '0.2rem' }}></i>
          </button>
          <div className={`more-dropdown-menu ${isMoreOpen ? 'active' : ''}`}>
            {exploreNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`} onClick={() => setIsMoreOpen(false)}>
                <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="header-actions">
        {location.pathname !== '/' && (
          <div className="header-search-container">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" className="header-search-input" placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={handleSearchKeyPress} />
          </div>
        )}

        <div className="notification-bell header-action-btn">
          <i className="fa-solid fa-bell"></i>
          {pendingNotifs > 0 && <div className="notification-badge"></div>}
        </div>

        {user ? (
          <div className="profile-dropdown-container" ref={profileRef}>
            <button className="profile-trigger" onClick={() => setIsProfileOpen(prev => !prev)}>
              <img className="profile-avatar-top" src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff5500&color=fff`} alt={user.name} />
            </button>
            <div className={`profile-dropdown-menu ${isProfileOpen ? 'active' : ''}`}>
              <div className="dropdown-user-header">
                <span className="dropdown-user-name">{user.name}</span>
                <span className="dropdown-user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm header-signin-btn">
            <i className="fa-solid fa-right-to-bracket"></i> <span>Sign In</span>
          </Link>
        )}

        <button className="mobile-nav-toggle" onClick={() => setIsMobileOpen(prev => !prev)}>
          <i className={`fa-solid ${isMobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      <div className={`mobile-nav-drawer ${isMobileOpen ? 'active' : ''}`}>
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}></i>
          <input type="text" className="header-search-input" placeholder="Search projects..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={handleSearchKeyPress} style={{ width: '100%', borderRadius: '10px', paddingLeft: '2.2rem', border: '1px solid var(--border-light)', padding: '0.6rem 0.8rem 0.6rem 2.2rem' }} />
        </div>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {user ? (
            <button onClick={handleLogout} className="mobile-nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: '#dc2626' }}>
              <i className="fa-solid fa-right-from-bracket"></i> <span>Logout</span>
            </button>
          ) : (
            <NavLink to="/auth" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>
              <i className="fa-solid fa-right-to-bracket"></i> <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
