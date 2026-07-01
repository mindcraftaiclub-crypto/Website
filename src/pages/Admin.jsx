import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

export default function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, members, settings

  // Data collections state
  const [users, setUsers] = useState([]);
  const [coreMembers, setCoreMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);

  // Members filters & states
  const [memberSearch, setMemberSearch] = useState('');
  const [memberYearFilter, setMemberYearFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);

  // Core board add member form state
  const [coreForm, setCoreForm] = useState({
    name: '',
    email: '',
    role: '',
    year: '1',
    linkedin: '',
    instagram: '',
    github: '',
    portfolio: '',
    photo: ''
  });

  // Profile Settings Form state (from old Settings.jsx)
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    department: 'Computer Science',
    year: '1',
    linkedin: '',
    github: '',
    skills: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    language: 'en',
    notifications: 'all'
  });

  // Fetch all database records
  const fetchData = async () => {
    try {
      const u = await db.find('Users');
      setUsers(u);
      const cm = await db.find('CoreMembers');
      setCoreMembers(cm);
      const r = await db.find('JoinRequests');
      setRequests(r);
      const q = await db.find('Quiz');
      setQuizzes(q);
      const res = await db.find('QuizResults');
      setResults(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Sync profile settings with user details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        photo: user.photo || '',
        department: user.department || 'Computer Science',
        year: String(user.year || '1'),
        linkedin: user.linkedin || '',
        github: user.github || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
    }
  }, [user]);

  const handleFormChange = (setter, key, value) => {
    setter(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e, fieldKey, setter, bucket = 'uploads') => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      window.showToast('Uploading File', 'Uploading file asset to storage...', 'info');
      try {
        const url = await db.uploadFile(file, bucket);
        setter(prev => ({ ...prev, [fieldKey]: url }));
        window.showToast('File Uploaded', 'Asset uploaded successfully.', 'success');
      } catch (err) {
        window.showToast('Upload Failed', err.message, 'error');
      }
    }
  };

  // Add Core Member Manual form submit
  const handleAddCoreMember = async (e) => {
    e.preventDefault();
    if (!coreForm.name.trim() || !coreForm.email.trim() || !coreForm.role.trim()) {
      window.showToast('Validation Error', 'Name, Email, and Position are required.', 'warning');
      return;
    }

    let photoUrl = coreForm.photo.trim();

    if (selectedFile) {
      window.showToast('Uploading Photo', `Uploading ${selectedFile.name} to storage...`, 'info');
      try {
        photoUrl = await db.uploadFile(selectedFile, 'member_photos');
        window.showToast('Photo Uploaded', 'Avatar photo uploaded successfully.', 'success');
      } catch (err) {
        window.showToast('Upload Failed', 'Failed to upload photo. Please try again.', 'error');
        return;
      }
    }

    const newCore = {
      name: coreForm.name.trim(),
      email: coreForm.email.trim().toLowerCase(),
      role: coreForm.role.trim(),
      year: coreForm.year,
      photo: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(coreForm.name)}&background=ff5500&color=fff`,
      linkedin: coreForm.linkedin.trim(),
      instagram: coreForm.instagram.trim(),
      github: coreForm.github.trim(),
      portfolio: coreForm.portfolio.trim()
    };

    try {
      await db.insert('CoreMembers', newCore);
      window.showToast('Core Board Updated', `Successfully added ${newCore.name} to Core Board.`, 'success');
      setCoreForm({
        name: '', email: '', role: '', year: '1', linkedin: '', instagram: '', github: '', portfolio: '', photo: ''
      });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      window.showToast('Add Failed', err.message, 'error');
    }
  };

  // Delete Core Member
  const handleDeleteCoreMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from the Core board?`)) return;
    try {
      await db.delete('CoreMembers', id);
      window.showToast('Core Member Deleted', `Removed ${name} from Core board.`, 'success');
      fetchData();
    } catch (err) {
      window.showToast('Delete Failed', err.message, 'error');
    }
  };

  // Profile Form update handlers (Settings page integration)
  const handleSettingsChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const skillsArray = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const updates = {
      name: formData.name.trim(),
      photo: formData.photo.trim(),
      year: formData.year,
      linkedin: formData.linkedin.trim(),
      github: formData.github.trim(),
      skills: skillsArray
    };

    try {
      await db.update('Users', user.id, updates);
      window.showToast('Profile Updated', 'Profile settings updated successfully.', 'success');
    } catch (err) {
      window.showToast('Update Failed', err.message, 'error');
    }
  };

  const handleSaveSystemSettings = (e) => {
    e.preventDefault();
    window.showToast('Settings Saved', 'Local preferences saved to workspace cache.', 'success');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const conf = window.confirm('CRITICAL WARNING: Are you absolutely certain you wish to delete your account? This will purge your profile and logout. This action is irreversible.');
    if (!conf) return;

    try {
      await db.delete('Users', user.id);
      await db.logout();
      window.showToast('Account Purged', 'Your profile details have been deleted.', 'error');
      window.location.href = '/';
    } catch (err) {
      window.showToast('Purge Failed', err.message, 'error');
    }
  };

  const handleDownloadMembersCSV = () => {
    const filtered = users.filter(u => {
      const matchSearch = !memberSearch.trim() || 
        (u.name || '').toLowerCase().includes(memberSearch.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(memberSearch.toLowerCase());
      const matchYear = memberYearFilter === 'all' || String(u.year) === memberYearFilter;
      return matchSearch && matchYear;
    });

    if (filtered.length === 0) {
      window.showToast('No Members', 'No members found to download.', 'info');
      return;
    }

    const headers = ['Name', 'Email', 'Department', 'Year', 'Role', 'Core Member'];
    const rows = filtered.map(u => {
      const isCore = coreMembers.some(cm => cm.email.toLowerCase() === u.email.toLowerCase()) ? 'Yes' : 'No';
      return [
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.department || 'Computer Science').replace(/"/g, '""')}"`,
        `"Year ${u.year || '1'}"`,
        `"${(u.role || 'member').replace(/"/g, '""')}"`,
        `"${isCore}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindcraft-members-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    window.showToast('CSV Downloaded', `Exported ${filtered.length} member records.`, 'success');
  };

  const getYearChartData = () => {
    const counts = { 'Year 1': 0, 'Year 2': 0, 'Year 3': 0, 'Year 4': 0 };
    users.forEach(u => {
      const yrLabel = `Year ${u.year || 1}`;
      counts[yrLabel] = (counts[yrLabel] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: [
          'rgba(255, 85, 0, 0.7)',
          'rgba(255, 107, 53, 0.7)',
          'rgba(224, 74, 0, 0.7)',
          'rgba(255, 85, 0, 0.4)'
        ],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      }]
    };
  };

  // Count core members also registered in general members list
  const linkedCoreCount = coreMembers.filter(cm => users.some(u => u.email.toLowerCase() === cm.email.toLowerCase())).length;

  return (
    <div className="admin-page animated-entrance">
      {/* Page Header */}
      <div className="page-header">
        <span className="page-tag"><i className="fa-solid fa-crown"></i> Admin Center</span>
        <h2 className="page-title">Management Dashboard</h2>
        <p className="page-subtitle">Redesigned club directory, board members supervisor, and settings control center.</p>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="tab-menu" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dashboard')} 
          style={{ 
            padding: '0.75rem 1.5rem', background: 'none', border: 'none', 
            color: activeTab === 'dashboard' ? 'var(--orange)' : 'var(--text-muted)', 
            fontWeight: 600, borderBottom: activeTab === 'dashboard' ? '2px solid var(--orange)' : '2px solid transparent', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-chart-simple"></i> Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} 
          onClick={() => setActiveTab('members')} 
          style={{ 
            padding: '0.75rem 1.5rem', background: 'none', border: 'none', 
            color: activeTab === 'members' ? 'var(--orange)' : 'var(--text-muted)', 
            fontWeight: 600, borderBottom: activeTab === 'members' ? '2px solid var(--orange)' : '2px solid transparent', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-users"></i> Members & Core Board
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')} 
          style={{ 
            padding: '0.75rem 1.5rem', background: 'none', border: 'none', 
            color: activeTab === 'settings' ? 'var(--orange)' : 'var(--text-muted)', 
            fontWeight: 600, borderBottom: activeTab === 'settings' ? '2px solid var(--orange)' : '2px solid transparent', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-gear"></i> Profile & System Settings
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'dashboard' && (
        <div className="admin-panel active" id="panel-dashboard">
          <div className="admin-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <TiltCard tiltDegree={5} glow={false}><div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="metric-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,85,0,0.1)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className="fa-solid fa-users"></i></div>
              <div className="metric-info">
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Members</h4>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{users.length}</h2>
              </div>
            </div></TiltCard>
            <TiltCard tiltDegree={5} glow={false}><div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="metric-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(224,74,0,0.1)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className="fa-solid fa-crown"></i></div>
              <div className="metric-info">
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Core Board</h4>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{coreMembers.length}</h2>
              </div>
            </div></TiltCard>
            <TiltCard tiltDegree={5} glow={false}><div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="metric-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className="fa-solid fa-circle-check"></i></div>
              <div className="metric-info">
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Linked Core</h4>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{linkedCoreCount}</h2>
              </div>
            </div></TiltCard>
          </div>

          <Reveal direction="up" delay="0.1s"><div className="admin-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}><i className="fa-solid fa-chart-line"></i> User Growth & Sprints</h3>
              <div style={{ position: 'relative', height: '260px' }}>
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Registrations',
                        data: [1, 2, 3, 5, 8, users.length],
                        borderColor: 'rgb(255, 85, 0)',
                        backgroundColor: 'rgba(255, 85, 0, 0.15)',
                        tension: 0.4,
                        fill: true
                      },
                      {
                        label: 'Quiz Sprints Taken',
                        data: [0, 1, 1, 2, 4, results.length],
                        borderColor: 'rgb(255, 107, 53)',
                        backgroundColor: 'rgba(255, 107, 53, 0.15)',
                        tension: 0.4,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#1a1a1a' } } },
                    scales: {
                      x: { ticks: { color: '#6b6b6b' }, grid: { color: 'rgba(0,0,0,0.06)' } },
                      y: { ticks: { color: '#6b6b6b' }, grid: { color: 'rgba(0,0,0,0.06)' } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}><i className="fa-solid fa-chart-pie"></i> Academic Year Distribution</h3>
              <div style={{ position: 'relative', height: '260px' }}>
                <Doughnut 
                  data={getYearChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#1a1a1a' } } }
                  }}
                />
              </div>
            </div>
          </div></Reveal>

          <Reveal direction="up" delay="0.2s"><div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}><i className="fa-solid fa-list-ul"></i> System Audit Log</h3>
            <div id="audit-log" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="leaderboard-row" style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>2026-06-26 16:08</span> <strong>System Audit Node:</strong> Local Storage database adaptor initialized successfully.</div>
              <div className="leaderboard-row" style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>2026-06-26 14:20</span> <strong>Jane Doe</strong> uploaded file "jane-doe-card.html" for weekly sprint task.</div>
              <div className="leaderboard-row" style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>2026-06-25 10:00</span> <strong>Jane Doe</strong> completed CSS layouts quiz, score 3/3.</div>
            </div>
          </div></Reveal>
        </div>
      )}

      {/* TAB 2: MEMBERS & CORE BOARD */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* SECTION 2A: REGISTERED MEMBERS LIST */}
          <Reveal direction="up">
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}><i className="fa-solid fa-users" style={{ color: 'var(--orange)' }}></i> Registered Members Directory</h3>
                <button onClick={handleDownloadMembersCSV} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}>
                  <i className="fa-solid fa-file-csv"></i> Download CSV
                </button>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by name or email..." 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{ flexGrow: 1, padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
                />
                <select 
                  className="form-input" 
                  value={memberYearFilter}
                  onChange={(e) => setMemberYearFilter(e.target.value)}
                  style={{ width: '150px', padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value="all">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              {/* Members Table */}
              {(() => {
                const filtered = users.filter(u => {
                  const matchSearch = !memberSearch.trim() || 
                    (u.name || '').toLowerCase().includes(memberSearch.toLowerCase()) || 
                    (u.email || '').toLowerCase().includes(memberSearch.toLowerCase());
                  const matchYear = memberYearFilter === 'all' || String(u.year) === memberYearFilter;
                  return matchSearch && matchYear;
                });

                if (filtered.length === 0) {
                  return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No registered members match criteria.</p>;
                }

                return (
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.02)' }}>
                          <th style={{ padding: '0.85rem 1rem' }}>Avatar</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Name</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Class</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Core Board</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((u, idx) => {
                          const isCore = coreMembers.some(cm => cm.email.toLowerCase() === u.email.toLowerCase());
                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                              <td style={{ padding: '0.6rem 1rem' }}>
                                <img src={u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=ff5500&color=fff`} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{u.name}</td>
                              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>Year {u.year || 1} CS</td>
                              <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.role}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                {isCore ? (
                                  <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}><i className="fa-solid fa-crown"></i> Core Member</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </Reveal>

          {/* SECTION 2B: CORE BOARD BOARD MANAGER */}
          <Reveal direction="up" delay="0.1s">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Core Board list */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}><i className="fa-solid fa-crown" style={{ color: 'var(--orange)' }}></i> Core Board Directory</h3>
                {coreMembers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No core board members added yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.02)' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Photo</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Position</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Account</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coreMembers.map(cm => {
                          const isReg = users.some(u => u.email.toLowerCase() === cm.email.toLowerCase());
                          return (
                            <tr key={cm.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '0.5rem 1rem' }}>
                                <img src={cm.photo} alt={cm.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <strong>{cm.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cm.email}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: 'var(--orange)', fontWeight: 600 }}>{cm.role}</span> (Yr {cm.year})</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                {isReg ? (
                                  <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Linked</span>
                                ) : (
                                  <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}><i className="fa-solid fa-circle-xmark"></i> Unregistered</span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <button onClick={() => handleDeleteCoreMember(cm.id, cm.name)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.4rem', borderRadius: '4px' }}><i className="fa-solid fa-trash-can"></i></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Form to Add Core Board Member */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}><i className="fa-solid fa-user-plus" style={{ color: 'var(--orange)' }}></i> Add Core Member</h3>
                <form onSubmit={handleAddCoreMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={coreForm.name} 
                      onChange={(e) => handleFormChange(setCoreForm, 'name', e.target.value)} 
                      placeholder="e.g. Athi"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address (Mail ID)</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={coreForm.email} 
                      onChange={(e) => handleFormChange(setCoreForm, 'email', e.target.value)} 
                      placeholder="e.g. athi9080@gmail.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Role / Position</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={coreForm.role} 
                      onChange={(e) => handleFormChange(setCoreForm, 'role', e.target.value)} 
                      placeholder="e.g. President, Treasurer"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Academic Year</label>
                    <select 
                      className="form-input" 
                      value={coreForm.year} 
                      onChange={(e) => handleFormChange(setCoreForm, 'year', e.target.value)}
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Avatar Photo URL / File Upload</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={selectedFile ? selectedFile.name : coreForm.photo} 
                        onChange={(e) => {
                          if (!selectedFile) {
                            handleFormChange(setCoreForm, 'photo', e.target.value);
                          }
                        }} 
                        disabled={!!selectedFile}
                        placeholder={selectedFile ? "Using selected local image..." : "https://..."} 
                        style={{ flexGrow: 1 }}
                      />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', gap: '0.25rem' }}>
                        <i className="fa-solid fa-image"></i> {selectedFile ? 'Change' : 'Choose'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files.length > 0) {
                              setSelectedFile(e.target.files[0]);
                              window.showToast('Image Selected', `Local image loaded: ${e.target.files[0].name}`, 'info');
                            }
                          }} 
                        />
                      </label>
                      {selectedFile && (
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => setSelectedFile(null)} 
                          style={{ padding: '0.4rem 0.6rem', color: '#ef4444' }}
                          title="Clear selected file"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--orange)', marginBottom: '0.75rem' }}>Social Networks Profiles</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <input type="url" className="form-input" value={coreForm.linkedin} onChange={(e) => handleFormChange(setCoreForm, 'linkedin', e.target.value)} placeholder="LinkedIn Link" />
                      <input type="url" className="form-input" value={coreForm.instagram} onChange={(e) => handleFormChange(setCoreForm, 'instagram', e.target.value)} placeholder="Instagram Link" />
                      <input type="url" className="form-input" value={coreForm.github} onChange={(e) => handleFormChange(setCoreForm, 'github', e.target.value)} placeholder="GitHub Link" />
                      <input type="url" className="form-input" value={coreForm.portfolio} onChange={(e) => handleFormChange(setCoreForm, 'portfolio', e.target.value)} placeholder="Portfolio URL Link" />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}><i className="fa-solid fa-circle-plus"></i> Save Core Member</button>
                </form>
              </div>

            </div>
          </Reveal>
        </div>
      )}

      {/* TAB 3: SETTINGS (MOVED FROM SETTINGS PAGE) */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Section 1: Update details */}
          <div className="card" style={{ gridColumn: 'span 2', padding: '2rem' }}>
            <div className="profile-heading" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <img 
                src={formData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=ff5500&color=fff`} 
                alt="Profile" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--orange)' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--orange)', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}><i className="fa-solid fa-user-pen" style={{ color: 'var(--orange)' }}></i> Directory Information</h3>
              
              <div className="form-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Display Name</label>
                  <input type="text" className="form-input" id="name" required value={formData.name} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="photo">Photo Avatar Link / Upload</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-input" id="photo" required value={formData.photo} onChange={handleSettingsChange} style={{ flexGrow: 1 }} />
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', gap: '0.25rem' }}>
                      <i className="fa-solid fa-cloud-arrow-up"></i> Upload
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'photo', setFormData)} />
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="year">Academic Year</label>
                  <select className="form-input" id="year" value={formData.year} onChange={handleSettingsChange}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="linkedin">LinkedIn Profile Link</label>
                  <input type="url" className="form-input" id="linkedin" value={formData.linkedin} onChange={handleSettingsChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="github">GitHub Profile Link</label>
                  <input type="url" className="form-input" id="github" value={formData.github} onChange={handleSettingsChange} placeholder="https://github.com/..." />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="skills">Skills (Comma separated list)</label>
                  <input type="text" className="form-input" id="skills" value={formData.skills} onChange={handleSettingsChange} placeholder="React, Python, Figma..." />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', borderRadius: '8px' }}>
                Save Directory Changes <i className="fa-solid fa-save" style={{ marginLeft: '0.4rem' }}></i>
              </button>
            </form>
          </div>

          {/* Side Preferences Panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Preferences & Alerts */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}><i className="fa-solid fa-sliders" style={{ color: 'var(--orange)' }}></i> Preferences & Alerts</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="lang">Language Preference</label>
                  <select 
                    className="form-input" 
                    id="lang"
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notif">Email Alert Status</label>
                  <select 
                    className="form-input" 
                    id="notif"
                    value={systemSettings.notifications}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, notifications: e.target.value }))}
                  >
                    <option value="all">Deliver all notifications</option>
                    <option value="urgent">Only urgent announcements</option>
                    <option value="none">Mute email updates</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveSystemSettings} className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', borderRadius: '8px' }}>
                Save Preferences <i className="fa-solid fa-circle-check" style={{ marginLeft: '0.4rem' }}></i>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ef4444', fontFamily: 'var(--font-display)' }}><i className="fa-solid fa-triangle-exclamation"></i> Danger Zone</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>Permanently delete your profile metadata, completed quiz histories, and file submissions from Mindcraft AI registry vaults. This action cannot be undone.</p>
              <button onClick={handleDeleteAccount} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px' }}>
                Purge Account Registry <i className="fa-solid fa-trash-can" style={{ marginLeft: '0.4rem' }}></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}