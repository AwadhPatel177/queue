import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Users, BarChart3, Building2, LogOut, ShieldCheck, RefreshCw, FastForward, CheckCircle, Clock, UserCheck, XCircle, AlertCircle, Bell } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'General Medicine', icon: '🩺', color: '#2563eb' },
  { name: 'Pediatrics', icon: '👶', color: '#f59e0b' },
  { name: 'Orthopedics', icon: '🦴', color: '#8b5cf6' },
  { name: 'Gynecology', icon: '🏥', color: '#ec4899' },
  { name: 'ENT', icon: '👂', color: '#f97316' },
  { name: 'Dermatology', icon: '🧴', color: '#06b6d4' },
  { name: 'Cardiology', icon: '❤️', color: '#ef4444' },
  { name: 'Ophthalmology', icon: '👁️', color: '#10b981' },
  { name: 'Dental', icon: '🦷', color: '#6366f1' },
];

const HospitalDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tokens, setTokens] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const BACKEND = 'http://localhost:5000/api';

  const loadTokens = () => {
    const allTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    // Show tokens for this hospital (match by hospitalName or hospitalId)
    const myTokens = allTokens.filter(t => t.hospitalId === user.id || t.hospitalName === user.name);
    setTokens(myTokens);
  };

  useEffect(() => {
    loadTokens();
    const interval = setInterval(loadTokens, 2000); // Auto refresh every 2 seconds
    return () => clearInterval(interval);
  }, [refreshKey]);

  const callNextPatient = async (dept) => {
    const allTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    const waiting = allTokens.filter(
      t => (t.hospitalId === user.id || t.hospitalName === user.name) && t.department === dept && t.status === 'Waiting'
    );
    // Emergency patients first, then by time
    waiting.sort((a, b) => {
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    if (waiting.length > 0) {
      const next = waiting[0];
      const idx = allTokens.findIndex(t => t.id === next.id);
      allTokens[idx].status = 'Called';
      allTokens[idx].calledAt = new Date().toISOString();
      localStorage.setItem('tokens', JSON.stringify(allTokens));
      loadTokens();

      // Sync to MongoDB if we have the backend token id
      if (next.dbId) {
        try {
          await fetch(`${BACKEND}/token/${next.dbId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Called' })
          });
        } catch (err) {
          console.error('Failed to sync Called status to MongoDB:', err);
        }
      }
    }
  };

  const completePatient = async (tokenId) => {
    const allTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    const idx = allTokens.findIndex(t => t.id === tokenId);
    if (idx !== -1) {
      const dbId = allTokens[idx].dbId;
      allTokens[idx].status = 'Completed';
      allTokens[idx].completedAt = new Date().toISOString();
      localStorage.setItem('tokens', JSON.stringify(allTokens));
      loadTokens();

      // Sync to MongoDB if we have the backend token id
      if (dbId) {
        try {
          await fetch(`${BACKEND}/token/${dbId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
          });
        } catch (err) {
          console.error('Failed to sync Completed status to MongoDB:', err);
        }
      }
    }
  };

  const totalTokens = tokens.length;
  const activeTokens = tokens.filter(t => t.status === 'Waiting').length;
  const completedTokens = tokens.filter(t => t.status === 'Completed').length;
  const calledTokens = tokens.filter(t => t.status === 'Called').length;
  const emergencyTokens = tokens.filter(t => t.isEmergency && t.status === 'Waiting').length;

  const getDeptTokens = (dept) => tokens.filter(t => t.department === dept);
  const getDeptWaiting = (dept) => tokens.filter(t => t.department === dept && t.status === 'Waiting').length;
  const getDeptCurrent = (dept) => {
    const called = tokens.find(t => t.department === dept && t.status === 'Called');
    return called ? called.tokenNumber : '-';
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  // Crowd zones simulation
  const crowdZones = [
    { name: 'Main Hall', count: 12 + activeTokens, level: activeTokens > 5 ? 'High' : activeTokens > 2 ? 'Medium' : 'Low' },
    { name: 'Pharmacy', count: 8 + Math.floor(activeTokens / 2), level: activeTokens > 4 ? 'Medium' : 'Low' },
    { name: 'Registration', count: 5 + activeTokens, level: activeTokens > 3 ? 'High' : 'Medium' },
    { name: 'Waiting Area', count: 10 + activeTokens * 2, level: activeTokens > 3 ? 'High' : 'Medium' },
  ];

  const getCrowdColor = (level) => {
    if (level === 'Low') return { bg: 'var(--secondary-bg)', text: '#059669', numColor: '#059669' };
    if (level === 'Medium') return { bg: 'var(--accent-bg)', text: '#d97706', numColor: '#d97706' };
    return { bg: 'var(--danger-bg)', text: '#dc2626', numColor: '#dc2626' };
  };

  const sidebarItems = [
    { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: 'tokens', icon: <ClipboardList size={18} />, label: 'Tokens' },
    { key: 'crowd', icon: <Users size={18} />, label: 'Crowd' },
    { key: 'analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
    { key: 'departments', icon: <Building2 size={18} />, label: 'Departments' },
  ];

  const renderDashboard = () => (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
            <ClipboardList size={20} />
          </div>
          <div>
            <h3>{totalTokens}</h3>
            <p>Total Tokens</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--secondary-bg)', color: 'var(--secondary)' }}>
            <Users size={20} />
          </div>
          <div>
            <h3>{activeTokens}</h3>
            <p>Active Tokens</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <h3>{completedTokens}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            <Clock size={20} />
          </div>
          <div>
            <h3>{activeTokens > 0 ? activeTokens * 10 : 0}</h3>
            <p>Avg Wait (min)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--orange-bg)', color: 'var(--orange)' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <h3>{activeTokens + calledTokens + completedTokens}</h3>
            <p>Current Crowd</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            <XCircle size={20} />
          </div>
          <div>
            <h3>{emergencyTokens}</h3>
            <p>Emergency</p>
          </div>
        </div>
      </div>

      {/* Department Queues + Crowd */}
      <div className="grid-3">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={18} color="var(--primary)" /> Department Queues
            </h3>
            <button onClick={() => setRefreshKey(r => r + 1)} style={{ border: 'none', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}>
              <RefreshCw size={16} />
            </button>
          </div>
          <table className="dept-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Current</th>
                <th>Waiting</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map(dept => {
                const waiting = getDeptWaiting(dept.name);
                const current = getDeptCurrent(dept.name);
                return (
                  <tr key={dept.name}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{dept.icon}</span>
                        <b style={{ fontSize: 13 }}>{dept.name}</b>
                      </div>
                    </td>
                    <td>
                      <span className="dept-badge" style={{ background: current !== '-' ? '#dbeafe' : '#f1f5f9', color: current !== '-' ? '#1d4ed8' : '#94a3b8' }}>
                        {current}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{waiting}</td>
                    <td>
                      <button className="next-btn" onClick={() => callNextPatient(dept.name)} disabled={waiting === 0}>
                        <FastForward size={14} /> Next
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--primary)" /> Crowd Zones
            </h3>
          </div>
          <div className="crowd-grid">
            {crowdZones.map(z => {
              const c = getCrowdColor(z.level);
              return (
                <div key={z.name} className="crowd-card" style={{ background: c.bg }}>
                  <h4>{z.name}</h4>
                  <div className="crowd-number" style={{ color: c.numColor }}>{z.count}</div>
                  <div className="crowd-level" style={{ color: c.text }}>{z.level}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTokens = () => (
    <div className="fade-in">
      <h2 style={{ marginBottom: 16 }}>All Tokens</h2>
      {tokens.length === 0 ? (
        <div className="card text-center" style={{ padding: 40 }}>
          <p style={{ color: 'var(--text-sub)' }}>No tokens yet. Waiting for patient bookings...</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="dept-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Department</th>
                <th>Status</th>
                <th>Emergency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => (
                <tr key={t.id}>
                  <td><b>{t.tokenNumber}</b></td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{t.age}y / {t.gender}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{t.department}</td>
                  <td>
                    <span className={`badge ${t.status === 'Waiting' ? 'badge-yellow' : t.status === 'Called' ? 'badge-blue' : 'badge-green'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.isEmergency ? <span className="badge badge-red">Yes</span> : <span style={{ color: 'var(--text-light)', fontSize: 13 }}>No</span>}
                  </td>
                  <td>
                    {t.status === 'Called' && (
                      <button className="next-btn" style={{ background: 'var(--secondary-bg)', color: '#059669' }} onClick={() => completePatient(t.id)}>
                        <CheckCircle size={14} /> Done
                      </button>
                    )}
                    {t.status === 'Waiting' && (
                      <button className="next-btn" onClick={() => callNextPatient(t.department)}>
                        <Bell size={14} /> Call
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCrowd = () => (
    <div className="fade-in">
      <h2 style={{ marginBottom: 16 }}>Crowd Monitoring</h2>
      <div className="crowd-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {crowdZones.map(z => {
          const c = getCrowdColor(z.level);
          return (
            <div key={z.name} className="crowd-card" style={{ background: c.bg, padding: 24 }}>
              <h4>{z.name}</h4>
              <div className="crowd-number" style={{ color: c.numColor, fontSize: 48 }}>{z.count}</div>
              <div className="crowd-level" style={{ color: c.text }}>{z.level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="fade-in">
      <h2 style={{ marginBottom: 16 }}>Analytics</h2>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}><ClipboardList size={20} /></div><div><h3>{totalTokens}</h3><p>Daily Patients</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><Clock size={20} /></div><div><h3>12:30 PM</h3><p>Peak Hour</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--secondary-bg)', color: 'var(--secondary)' }}><UserCheck size={20} /></div><div><h3>{activeTokens > 0 ? (activeTokens * 10) : 0}m</h3><p>Avg Wait Time</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><AlertCircle size={20} /></div><div><h3>{emergencyTokens}</h3><p>Emergency Cases</p></div></div>
      </div>
      <div className="card mt-24">
        <h3>Department Performance</h3>
        <table className="dept-table" style={{ marginTop: 12 }}>
          <thead><tr><th>Department</th><th>Tokens</th><th>Completed</th><th>Waiting</th></tr></thead>
          <tbody>
            {DEPARTMENTS.map(d => {
              const dt = getDeptTokens(d.name);
              return (
                <tr key={d.name}>
                  <td><span>{d.icon}</span> {d.name}</td>
                  <td>{dt.length}</td>
                  <td>{dt.filter(t => t.status === 'Completed').length}</td>
                  <td>{dt.filter(t => t.status === 'Waiting').length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="fade-in">
      <h2 style={{ marginBottom: 16 }}>Departments</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {DEPARTMENTS.map(d => (
          <div key={d.name} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{d.icon}</div>
            <h3 style={{ fontSize: 15 }}>{d.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{getDeptTokens(d.name).length} tokens today</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
              <span className="badge badge-yellow">{getDeptWaiting(d.name)} waiting</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const views = { dashboard: renderDashboard, tokens: renderTokens, crowd: renderCrowd, analytics: renderAnalytics, departments: renderDepartments };

  return (
    <div className="hospital-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><ShieldCheck size={18} color="white" /></div>
          SmartQUEUE
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button key={item.key} className={`sidebar-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={onLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="hospital-main">
        <div className="hospital-topbar">
          <div>
            <h1>{activeTab === 'dashboard' ? 'Dashboard Overview' : sidebarItems.find(s => s.key === activeTab)?.label}</h1>
            <p>{user.name}</p>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{dateStr}</span>
            <div className="topbar-user">
              <div className="topbar-avatar">{user.name[0]}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Dr. Admin</span>
            </div>
          </div>
        </div>
        {(views[activeTab] || renderDashboard)()}
      </main>
    </div>
  );
};

export default HospitalDashboard;
