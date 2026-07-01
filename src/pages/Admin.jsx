import { useState, useEffect, useRef } from 'react';
import db, { supabaseServiceClient } from '../db';

const TABS = [
  { id: 'members',      label: 'Members',       icon: 'fa-users' },
  { id: 'core',         label: 'Core Board',    icon: 'fa-star' },
  { id: 'events',       label: 'Events',        icon: 'fa-calendar' },
  { id: 'announcements',label: 'Announcements', icon: 'fa-bullhorn' },
  { id: 'stats',        label: 'Stats Config',  icon: 'fa-chart-simple' },
  { id: 'requests',     label: 'Applications',  icon: 'fa-file-signature' },
];

/* ── helpers ── */
function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function Badge({ color, children }) {
  const colors = {
    green:  { bg: '#dcfce7', text: '#15803d' },
    orange: { bg: '#ffedd5', text: '#c2410c' },
    blue:   { bg: '#dbeafe', text: '#1d4ed8' },
    grey:   { bg: '#f3f4f6', text: '#6b7280' },
  };
  const c = colors[color] || colors.grey;
  return (
    <span style={{ background: c.bg, color: c.text, padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════ MEMBERS TAB ═══════════════════════════════════ */
function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try { setMembers(await db.find('Users')); }
    catch { window.showToast('Error', 'Could not load members.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete member "${name}"?`)) return;
    try {
      await db.delete('Users', id);
      window.showToast('Member Deleted', 'The member record has been removed.', 'success');
      load();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const filtered = members.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.45rem 0.9rem', flex: 1, maxWidth: 320 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => downloadCSV(filtered, 'members.csv')}>
            <i className="fa-solid fa-download" /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>All Members</span>
          <Badge color="blue">{filtered.length} total</Badge>
        </div>
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Year</th><th>Department</th><th>Joined</th><th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No members found</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'U')}&background=ff5500&color=fff`} alt={m.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem' }}>{m.name || '—'}</span>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td><Badge color={m.role === 'admin' ? 'orange' : 'grey'}>{m.role || 'member'}</Badge></td>
                    <td>{m.year || '—'}</td>
                    <td>{m.department || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleDeleteMember(m.id, m.name)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ CORE BOARD TAB ═══════════════════════════════════ */
function CoreBoardTab({ allMembers }) {
  const [coreMembers, setCoreMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: '', year: '', linkedin: '', instagram: '', github: '', portfolio: '', description: '' });
  const fileRef = useRef();

  const load = async () => {
    try { setCoreMembers(await db.find('CoreMembers')); }
    catch { window.showToast('Error', 'Could not load core members.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const isLinkedMember = email => allMembers.some(m => m.email?.toLowerCase() === email?.toLowerCase());

  const handleStartEdit = m => {
    setEditingId(m.id);
    setForm({
      name: m.name || '',
      email: m.email || '',
      role: m.role || '',
      year: m.year || '',
      linkedin: m.linkedin || '',
      instagram: m.instagram || '',
      github: m.github || '',
      portfolio: m.portfolio || '',
      description: m.description || ''
    });
    setImagePreview(m.photo || '');
    setImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: '', year: '', linkedin: '', instagram: '', github: '', portfolio: '', description: '' });
    setImagePreview('');
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.role) {
      window.showToast('Missing Fields', 'Name, Email and Role are required.', 'error'); return;
    }
    setUploading(true);
    try {
      let photoUrl = imagePreview;

      if (imageFile) {
        // Upload image to Supabase
        const ext = imageFile.name.split('.').pop();
        const path = `core/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabaseServiceClient.storage.from('member_photos').upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabaseServiceClient.storage.from('member_photos').getPublicUrl(path);
        photoUrl = publicUrl;
      } else if (!photoUrl && !editingId) {
        window.showToast('No Photo', 'Please select a photo first.', 'error');
        setUploading(false);
        return;
      }

      if (editingId) {
        await db.update('CoreMembers', editingId, { ...form, photo: photoUrl });
        window.showToast('Updated!', `${form.name} updated successfully.`, 'success');
      } else {
        await db.insert('CoreMembers', { ...form, photo: photoUrl, createdAt: new Date().toISOString() });
        window.showToast('Added!', `${form.name} added to the Core Board.`, 'success');
      }
      handleCancelEdit();
      load();
    } catch (err) {
      window.showToast('Operation Failed', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name} from Core Board?`)) return;
    try {
      await db.delete('CoreMembers', id);
      window.showToast('Deleted', `${name} removed.`, 'success');
      setCoreMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
      {/* ADD FORM */}
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
            <i className={editingId ? "fa-solid fa-user-pen" : "fa-solid fa-user-plus"} style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />
            {editingId ? 'Edit Core Member' : 'Add Core Member'}
          </h3>

          {/* Photo Upload */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 0.75rem', background: 'var(--surface)', border: `2px dashed ${imagePreview ? 'var(--orange)' : 'var(--border)'}`, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.25s' }}>
              {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fa-solid fa-camera" style={{ color: 'var(--text-muted)', fontSize: '1.4rem' }} />}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
              <i className="fa-solid fa-upload" /> {imageFile ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {[
            { key: 'name',      placeholder: 'Full Name *',    icon: 'fa-user' },
            { key: 'email',     placeholder: 'Email *',        icon: 'fa-envelope' },
            { key: 'role',      placeholder: 'Role / Position *', icon: 'fa-id-badge' },
            { key: 'year',      placeholder: 'Year (e.g. 2024)', icon: 'fa-graduation-cap' },
            { key: 'linkedin',  placeholder: 'LinkedIn URL',   icon: 'fa-linkedin' },
            { key: 'instagram', placeholder: 'Instagram URL',  icon: 'fa-instagram' },
            { key: 'github',    placeholder: 'GitHub URL',     icon: 'fa-github' },
            { key: 'portfolio', placeholder: 'Portfolio URL',  icon: 'fa-globe' },
          ].map(({ key, placeholder, icon }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.85rem', marginBottom: '0.65rem' }}>
              <i className={`fa-${icon.includes('linkedin') || icon.includes('instagram') || icon.includes('github') ? 'brands' : 'solid'} ${icon}`} style={{ color: 'var(--text-muted)', fontSize: '0.82rem', width: 16, textAlign: 'center' }} />
              <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ border: 'none', background: 'none', fontSize: '0.86rem', color: 'var(--text)', width: '100%' }} />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.85rem', marginBottom: '0.65rem' }}>
            <i className="fa-solid fa-paragraph" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', width: 16, textAlign: 'center', marginTop: '0.25rem' }} />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description / Bio" rows={3} style={{ border: 'none', background: 'none', fontSize: '0.86rem', color: 'var(--text)', width: '100%', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
          </div>

          {form.email && (
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8, background: isLinkedMember(form.email) ? '#dcfce7' : '#fef9c3', fontSize: '0.78rem', color: isLinkedMember(form.email) ? '#15803d' : '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className={`fa-solid ${isLinkedMember(form.email) ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
              {isLinkedMember(form.email) ? 'Email found in members list — will be auto-linked.' : 'Email not found in members list.'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdd} disabled={uploading}>
              {uploading ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-check" /> {editingId ? 'Save Changes' : 'Add Member'}</>}
            </button>
            {editingId && (
              <button className="btn btn-secondary" style={{ padding: '0.72rem 1.2rem' }} onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORE MEMBERS LIST */}
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Current Core Board</span>
            <Badge color="orange">{coreMembers.length} members</Badge>
          </div>
          {loading ? <div className="loading-spinner" /> : (
            <div style={{ padding: '0.75rem' }}>
              {coreMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-star" style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.88rem' }}>No core members yet.</p>
                </div>
              ) : coreMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 10, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`} alt={m.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{m.name}</span>
                      {isLinkedMember(m.email) && <Badge color="green">Linked</Badge>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{m.role}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0077b5', fontSize: '0.85rem' }}><i className="fa-brands fa-linkedin" /></a>}
                      {m.github && <a href={m.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><i className="fa-brands fa-github" /></a>}
                      {m.instagram && <a href={m.instagram} target="_blank" rel="noreferrer" style={{ color: '#e1306c', fontSize: '0.85rem' }}><i className="fa-brands fa-instagram" /></a>}
                      {m.portfolio && <a href={m.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', fontSize: '0.85rem' }}><i className="fa-solid fa-globe" /></a>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => handleStartEdit(m)} style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                      title="Edit Member"
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button onClick={() => handleDelete(m.id, m.name)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.82rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                      title="Delete Member"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ EVENTS TAB ═══════════════════════════════════ */
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', venue: '', description: '', poster: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setEvents((await db.find('Events')).sort((a, b) => new Date(b.date) - new Date(a.date))); }
    catch { window.showToast('Error', 'Could not load events.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.date) { window.showToast('Missing Fields', 'Title and Date are required.', 'error'); return; }
    setSaving(true);
    try {
      await db.insert('Events', { ...form, createdAt: new Date().toISOString() });
      window.showToast('Event Added!', form.title, 'success');
      setForm({ title: '', date: '', venue: '', description: '', poster: '' });
      load();
    } catch (err) { window.showToast('Error', err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event: ${title}?`)) return;
    try { await db.delete('Events', id); setEvents(prev => prev.filter(e => e.id !== id)); window.showToast('Deleted', title, 'success'); }
    catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
          <i className="fa-solid fa-calendar-plus" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />Add Event
        </h3>
        {[
          { key: 'title', placeholder: 'Event Title *', type: 'text' },
          { key: 'date', placeholder: 'Date *', type: 'date' },
          { key: 'venue', placeholder: 'Venue / Location', type: 'text' },
          { key: 'poster', placeholder: 'Poster URL (optional)', type: 'text' },
        ].map(({ key, placeholder, type }) => (
          <input key={key} type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
            style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)', marginBottom: '0.65rem' }} />
        ))}
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3}
          style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)', marginBottom: '0.75rem', resize: 'vertical' }} />
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={saving}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-plus" /> Add Event</>}
        </button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.88rem' }}>All Events</div>
        {loading ? <div className="loading-spinner" /> : (
          <div style={{ padding: '0.75rem', maxHeight: 460, overflowY: 'auto' }}>
            {events.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No events yet.</div> : events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.85rem', borderRadius: 10, borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }} />{ev.date}
                    {ev.venue && <><i className="fa-solid fa-location-dot" style={{ marginLeft: '0.8rem', marginRight: '0.3rem' }} />{ev.venue}</>}
                  </div>
                </div>
                <button onClick={() => handleDelete(ev.id, ev.title)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.78rem', flexShrink: 0 }}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ ANNOUNCEMENTS TAB ═══════════════════════════════════ */
function AnnouncementsTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', important: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setList(await db.find('Announcements')); }
    catch { window.showToast('Error', 'Could not load announcements.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.content) { window.showToast('Missing Fields', 'Title and content are required.', 'error'); return; }
    setSaving(true);
    try {
      await db.insert('Announcements', { ...form, createdAt: new Date().toISOString() });
      window.showToast('Posted!', form.title, 'success');
      setForm({ title: '', content: '', important: false });
      load();
    } catch (err) { window.showToast('Error', err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete: ${title}?`)) return;
    try { await db.delete('Announcements', id); setList(prev => prev.filter(a => a.id !== id)); window.showToast('Deleted', title, 'success'); }
    catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
          <i className="fa-solid fa-bullhorn" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />New Announcement
        </h3>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title *"
          style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)', marginBottom: '0.65rem' }} />
        <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Content *" rows={4}
          style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)', marginBottom: '0.75rem', resize: 'vertical' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', cursor: 'pointer', marginBottom: '0.9rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={form.important} onChange={e => setForm(p => ({ ...p, important: e.target.checked }))} style={{ accentColor: 'var(--orange)', width: 16, height: 16 }} />
          Mark as Important
        </label>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={saving}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Posting…</> : <><i className="fa-solid fa-paper-plane" /> Post Announcement</>}
        </button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.88rem' }}>All Announcements</div>
        {loading ? <div className="loading-spinner" /> : (
          <div style={{ padding: '0.75rem', maxHeight: 460, overflowY: 'auto' }}>
            {list.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No announcements yet.</div> : list.map(a => (
              <div key={a.id} style={{ padding: '0.85rem', borderRadius: 10, borderLeft: `3px solid ${a.important ? 'var(--orange)' : 'var(--border)'}`, background: a.important ? 'rgba(255,85,0,0.03)' : 'transparent', marginBottom: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{a.title}</span>
                    {a.important && <Badge color="orange">Important</Badge>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.content}</div>
                </div>
                <button onClick={() => handleDelete(a.id, a.title)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.78rem', flexShrink: 0 }}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ STATS CONFIG TAB ═══════════════════════════════════ */
function StatsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ projectsCount: '40+', awardsCount: '6' });

  useEffect(() => {
    (async () => {
      try {
        const s = await db.getSettings();
        setForm({
          projectsCount: s.projectsCount ?? '40+',
          awardsCount: s.awardsCount ?? '6'
        });
      } catch (err) {
        window.showToast('Error', 'Could not load settings.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.updateSettings(form);
      window.showToast('Stats Saved', 'Homepage statistics updated successfully.', 'success');
    } catch (err) {
      window.showToast('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.75rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text)' }}>
        <i className="fa-solid fa-chart-simple" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />
        Homepage Stat Config
      </h3>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
          👥 Members Count (Calculated Automatically)
        </label>
        <input disabled value="Auto-Calculated from database size" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-muted)', background: 'var(--surface)' }} />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
          📅 Events Count (Calculated Automatically)
        </label>
        <input disabled value="Auto-Calculated from database size" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-muted)', background: 'var(--surface)' }} />
      </div>

      {[
        { key: 'projectsCount', label: '🛠️ Projects Count', placeholder: 'e.g. 40+' },
        { key: 'awardsCount',   label: '🏆 Awards Count',   placeholder: 'e.g. 6' }
      ].map(field => (
        <div key={field.key} style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
            {field.label}
          </label>
          <input
            value={form[field.key]}
            onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)' }}
          />
        </div>
      ))}

      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={handleSave} disabled={saving}>
        {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Stats</>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════ APPLICATIONS TAB ═══════════════════════════════════ */
function RequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await db.find('JoinRequests');
      setRequests(list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
    } catch {
      window.showToast('Error', 'Could not load applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await db.update('JoinRequests', id, { status });
      window.showToast('Status Updated', `Application status set to ${status}.`, 'success');
      load();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await db.delete('JoinRequests', id);
      window.showToast('Deleted', 'Application request removed.', 'success');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Recruitment Applications</span>
        <Badge color="orange">{requests.length} submissions</Badge>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Details</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Contact</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Area</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Vibe Poll</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No applications received yet.
                </td>
              </tr>
            ) : requests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 500 }}>Reg: {r.registerNumber}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Class: {r.className}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                  <div>{r.email}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{r.phone}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>{r.interestedArea || '—'}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', textTransform: 'capitalize' }}>
                  {r.codingStyle ? r.codingStyle.replace('_', ' ') : '—'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <Badge color={r.status === 'Approved' ? 'green' : r.status === 'Rejected' ? 'grey' : 'orange'}>
                    {r.status || 'Pending'}
                  </Badge>
                </td>
                <td style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                  {r.status !== 'Approved' && (
                    <button onClick={() => handleStatus(r.id, 'Approved')} style={{ background: '#dcfce7', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#15803d', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                      Approve
                    </button>
                  )}
                  {r.status !== 'Rejected' && (
                    <button onClick={() => handleStatus(r.id, 'Rejected')} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#4b5563', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                      Reject
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ MAIN ADMIN PAGE ═══════════════════════════════════ */
export default function Admin({ user }) {
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ members: 0, core: 0, events: 0, announcements: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [m, c, e, a] = await Promise.all([
          db.find('Users'), db.find('CoreMembers'), db.find('Events'), db.find('Announcements')
        ]);
        setMembers(m);
        setStats({ members: m.length, core: c.length, events: e.length, announcements: a.length });
      } catch { /* ignore */ }
    })();
  }, []);

  const statCards = [
    { label: 'Total Members', value: stats.members, icon: 'fa-users',      color: '#3b82f6' },
    { label: 'Core Board',    value: stats.core,    icon: 'fa-star',       color: '#f59e0b' },
    { label: 'Events',        value: stats.events,  icon: 'fa-calendar',   color: '#10b981' },
    { label: 'Announcements', value: stats.announcements, icon: 'fa-bullhorn', color: 'var(--orange)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,85,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-crown" style={{ color: 'var(--orange)', fontSize: '1rem' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Welcome back, {user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '0.9rem' }} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', background: 'var(--surface)', padding: '0.3rem', borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '0.5rem 1.1rem', borderRadius: 9, fontSize: '0.84rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.22s', display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: tab === t.id ? 'var(--orange)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: tab === t.id ? '0 2px 8px rgba(255,85,0,0.25)' : 'none',
            }}
          >
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: '0.82rem' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'members'       && <MembersTab />}
      {tab === 'core'          && <CoreBoardTab allMembers={members} />}
      {tab === 'events'        && <EventsTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
      {tab === 'stats'         && <StatsTab />}
      {tab === 'requests'      && <RequestsTab />}
    </div>
  );
}