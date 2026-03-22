import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Clock, Users, Navigation, Star, ArrowRight, Stethoscope, ChevronRight, AlertTriangle, Phone, User, Calendar, ArrowLeft, Activity, CheckCircle, Bell, XCircle, ChevronDown, Radio, HelpCircle, Globe, History, Settings, LogOut, Cake, UserCheck, MessageCircle, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HOSPITALS = [
  {
    id: 'h1', name: 'AIIMS New Delhi', address: 'Ansari Nagar, New Delhi',
    distance: '2.5 km', crowdStatus: 'High', rating: 4.5,
    departments: [
      { name: 'General Medicine', avgWait: 45 },
      { name: 'Pediatrics', avgWait: 30 },
      { name: 'Orthopedics', avgWait: 25 },
      { name: 'Gynecology', avgWait: 35 },
      { name: 'ENT', avgWait: 15 },
      { name: 'Dermatology', avgWait: 20 },
      { name: 'Cardiology', avgWait: 50 },
      { name: 'Ophthalmology', avgWait: 20 },
    ]
  },
  {
    id: 'h2', name: 'Safdarjung Hospital', address: 'Ansari Nagar East, New Delhi',
    distance: '3.2 km', crowdStatus: 'Medium', rating: 4.2,
    departments: [
      { name: 'General Medicine', avgWait: 35 },
      { name: 'Pediatrics', avgWait: 25 },
      { name: 'Orthopedics', avgWait: 40 },
      { name: 'Dental', avgWait: 20 },
    ]
  },
  {
    id: 'h3', name: 'Ram Manohar Lohia Hospital', address: 'Baba Kharak Singh Marg',
    distance: '5.1 km', crowdStatus: 'Low', rating: 4.0,
    departments: [
      { name: 'General Medicine', avgWait: 15 },
      { name: 'ENT', avgWait: 10 },
      { name: 'Dermatology', avgWait: 12 },
    ]
  }
];

const crowdColor = (s) => s === 'Low' ? 'badge-green' : s === 'Medium' ? 'badge-yellow' : 'badge-red';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const PatientHome = ({ user, onLogout }) => {
  const [view, setView] = useState('home');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [patientData, setPatientData] = useState({ name: user.name, mobile: user.mobile, age: '', gender: 'Male', symptoms: '', isEmergency: false });
  const [activeToken, setActiveToken] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTokenDetail, setSelectedTokenDetail] = useState(null);
  const [allTokens, setAllTokens] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: `Hi ${user.name}! 👋 I'm your SmartQueue AI assistant. How can I help you today?`, time: new Date().toISOString() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Generate notifications from tokens
  const generateNotifications = (tokens) => {
    const myTokens = tokens.filter(t => t.patientMobile === user.mobile);
    const notifs = [];
    myTokens.forEach(t => {
      notifs.push({ id: t.id + '_booked', type: 'booking', title: 'Token Booked', message: `Token ${t.tokenNumber} booked at ${t.hospitalName} - ${t.department}`, time: t.createdAt, icon: 'ticket' });
      if (t.status === 'Called') {
        notifs.push({ id: t.id + '_called', type: 'alert', title: '🔔 Your Turn!', message: `Token ${t.tokenNumber} has been called. Please proceed to the doctor.`, time: t.calledAt || t.createdAt, icon: 'bell' });
      }
      if (t.status === 'Completed') {
        notifs.push({ id: t.id + '_done', type: 'success', title: 'Visit Completed', message: `Token ${t.tokenNumber} at ${t.hospitalName} is completed.`, time: t.completedAt || t.createdAt, icon: 'check' });
      }
    });
    // Sort by time, newest first
    notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    return notifs;
  };

  // Live refresh — reload tokens every 2 seconds
  useEffect(() => {
    const refresh = () => {
      const tokens = JSON.parse(localStorage.getItem('tokens') || '[]');
      setAllTokens(tokens);
      const myActive = tokens.find(t => t.patientMobile === user.mobile && (t.status === 'Waiting' || t.status === 'Called'));
      setActiveToken(myActive || null);
      setNotifications(generateNotifications(tokens));
      // Update selected token detail if viewing one
      if (selectedTokenDetail) {
        const updated = tokens.find(t => t.id === selectedTokenDetail.id);
        if (updated) setSelectedTokenDetail(updated);
      }
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [user.mobile, selectedTokenDetail?.id]);

  const handleBook = (e) => {
    e.preventDefault();
    const tokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    const hospTokens = tokens.filter(t => t.hospitalId === selectedHospital.id && t.department === selectedDept);
    const tokenNum = `${selectedDept.substring(0, 3).toUpperCase()}-${hospTokens.length + 1}`;

    const newToken = {
      id: 'tk_' + Date.now(),
      tokenNumber: tokenNum,
      patientName: patientData.name,
      patientMobile: patientData.mobile,
      age: patientData.age,
      gender: patientData.gender,
      symptoms: patientData.symptoms,
      isEmergency: patientData.isEmergency,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      department: selectedDept,
      status: 'Waiting',
      queuePosition: hospTokens.filter(t => t.status === 'Waiting').length + 1,
      createdAt: new Date().toISOString()
    };

    tokens.push(newToken);
    localStorage.setItem('tokens', JSON.stringify(tokens));
    setActiveToken(newToken);
    setSelectedTokenDetail(newToken);
    setView('tokenDetail');
    setActiveTab('tokens');
  };

  const filteredHospitals = HOSPITALS.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMyTokens = () => allTokens.filter(t => t.patientMobile === user.mobile);

  const getPatientsAhead = (token) => {
    if (!token) return 0;
    return allTokens.filter(t =>
      t.hospitalId === token.hospitalId &&
      t.department === token.department &&
      t.status === 'Waiting' &&
      new Date(t.createdAt) < new Date(token.createdAt)
    ).length;
  };

  const getQueueForDept = (token) => {
    if (!token) return [];
    return allTokens.filter(t =>
      t.hospitalId === token.hospitalId &&
      t.department === token.department &&
      (t.status === 'Waiting' || t.status === 'Called')
    ).sort((a, b) => {
      if (a.status === 'Called' && b.status !== 'Called') return -1;
      if (b.status === 'Called' && a.status !== 'Called') return 1;
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  // RENDER: Home
  const renderHome = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>Hello, {user.name}! 👋</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Book your hospital appointment today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Notification Bell */}
          <button onClick={() => { setView('notifications'); setActiveTab('profile'); }} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={20} color="var(--text-main)" />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length > 9 ? '9+' : notifications.length}</span>
            )}
          </button>
          {/* User Avatar */}
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} onClick={() => { setView('profile'); setActiveTab('profile'); }}>
            {user.name[0]}
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', color: 'white', border: 'none', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: 20 }}>Skip the Lines</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '4px 0 16px' }}>Book tokens online and wait at home.</p>
            <button className="btn" style={{ background: 'white', color: 'var(--primary)', width: 'auto', padding: '10px 20px', fontSize: 14 }} onClick={() => { setView('hospitals'); setActiveTab('hospitals'); }}>
              Book Now <ArrowRight size={16} />
            </button>
          </div>
          <Stethoscope size={56} style={{ opacity: 0.2 }} />
        </div>
      </div>

      {/* LIVE QUEUE — Active Token with live updates */}
      {activeToken && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={16} color="var(--danger)" style={{ animation: 'pulse 1.5s infinite' }} /> Live Queue Status
          </h3>
          <div className="card" style={{
            border: activeToken.status === 'Called' ? '2px solid var(--secondary)' : activeToken.isEmergency ? '2px solid var(--danger)' : '2px solid var(--primary)',
            cursor: 'pointer',
            background: activeToken.status === 'Called' ? 'var(--secondary-bg)' : ''
          }}
            onClick={() => { setSelectedTokenDetail(activeToken); setView('tokenDetail'); setActiveTab('tokens'); }}
          >
            {activeToken.status === 'Called' && (
              <div style={{ background: 'var(--secondary)', color: 'white', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'center', animation: 'pulse 1.5s infinite' }}>
                🔔 YOUR TURN! Please proceed to the doctor.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={`badge ${activeToken.status === 'Called' ? 'badge-green' : activeToken.isEmergency ? 'badge-red' : 'badge-blue'}`}>
                  {activeToken.status === 'Called' ? '🔔 Called' : 'Active Token'}
                </span>
                <h2 style={{ marginTop: 8, fontSize: 28 }}>{activeToken.tokenNumber}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>{activeToken.hospitalName} • {activeToken.department}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {activeToken.status === 'Waiting' && (
                  <>
                    <p style={{ fontSize: 11, color: 'var(--text-sub)', margin: 0 }}>Patients Ahead</p>
                    <h2 style={{ color: 'var(--primary)', margin: '4px 0' }}>{getPatientsAhead(activeToken)}</h2>
                    <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>~{getPatientsAhead(activeToken) * 10}m wait</p>
                  </>
                )}
              </div>
            </div>

            {/* Mini live queue bar */}
            {activeToken.status === 'Waiting' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)', marginBottom: 4 }}>
                  <span>Queue Progress</span>
                  <span>{getPatientsAhead(activeToken)} ahead of you</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 3,
                    background: 'var(--primary)',
                    width: `${Math.max(10, 100 - (getPatientsAhead(activeToken) * 15))}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              Tap for live details →
            </div>
          </div>
        </div>
      )}

      {/* Nearby Hospitals */}
      <h3 style={{ marginBottom: 12, marginTop: 4 }}>
        <MapPin size={18} style={{ verticalAlign: 'text-bottom', marginRight: 6, color: 'var(--primary)' }} />
        Nearby Hospitals
      </h3>
      {HOSPITALS.slice(0, 2).map(h => (
        <div key={h.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedHospital(h); setView('booking'); setBookingStep(1); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 16 }}>{h.name}</h3>
              <p style={{ fontSize: 12, margin: '2px 0' }}>{h.address}</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Navigation size={14} color="var(--primary)" /> {h.distance}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} color="var(--accent)" /> ~{h.departments[0].avgWait}m</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} color="#f59e0b" fill="#f59e0b" /> {h.rating}</span>
              </div>
            </div>
            <span className={`badge ${crowdColor(h.crowdStatus)}`}>{h.crowdStatus}</span>
          </div>
        </div>
      ))}
      <button className="btn btn-outline mt-8" onClick={() => { setView('hospitals'); setActiveTab('hospitals'); }}>
        View All Hospitals
      </button>
    </div>
  );

  // RENDER: Hospitals
  const renderHospitals = () => (
    <div className="fade-in">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>
        <MapPin size={20} style={{ verticalAlign: 'text-bottom', marginRight: 6, color: 'var(--primary)' }} />
        Nearby Hospitals
      </h1>
      <p style={{ color: 'var(--text-sub)', fontSize: 14, marginBottom: 16 }}>Select a hospital to book appointment</p>

      <div className="search-bar">
        <Search size={18} />
        <input placeholder="Search hospitals..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {filteredHospitals.map(h => (
        <div key={h.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedHospital(h); setView('booking'); setBookingStep(1); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16 }}>{h.name}</h3>
              <p style={{ fontSize: 12, margin: '2px 0', color: 'var(--text-sub)' }}>{h.address}</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 13, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Navigation size={14} color="var(--primary)" /> {h.distance}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} color="var(--accent)" /> ~{h.departments[0].avgWait}m</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} color="#f59e0b" fill="#f59e0b" /> {h.rating}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {h.departments.length} depts</span>
              </div>
            </div>
            <span className={`badge ${crowdColor(h.crowdStatus)}`}>{h.crowdStatus}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // RENDER: Booking
  const renderBooking = () => (
    <div className="fade-in">
      <button onClick={() => { setView('hospitals'); setBookingStep(1); }} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--text-sub)', fontSize: 14 }}>
        ← Back to hospitals
      </button>
      <h2>{selectedHospital?.name}</h2>
      <p style={{ color: 'var(--text-sub)', fontSize: 13, marginBottom: 20 }}>Booking Appointment</p>

      <AnimatePresence mode="wait">
        {bookingStep === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 style={{ marginBottom: 12 }}>Select Department</h3>
            {selectedHospital?.departments.map(dept => (
              <div key={dept.name} className="card" style={{ cursor: 'pointer', border: selectedDept === dept.name ? '2px solid var(--primary)' : '', marginBottom: 10, padding: 14 }} onClick={() => setSelectedDept(dept.name)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0 }}>{dept.name}</h4>
                      <p style={{ margin: 0, fontSize: 12 }}>~{dept.avgWait} min wait</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-light)" />
                </div>
              </div>
            ))}
            <button className="btn btn-primary mt-16" disabled={!selectedDept} onClick={() => setBookingStep(2)}>
              Continue to Details
            </button>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 style={{ marginBottom: 12 }}>Patient Details</h3>
            <form onSubmit={handleBook}>
              <div className="card" style={{ border: patientData.isEmergency ? '2px solid var(--danger)' : '' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="form-input-icon"><User size={16} /><input className="form-input" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <div className="form-input-icon"><Calendar size={16} /><input className="form-input" type="number" placeholder="Age" value={patientData.age} onChange={e => setPatientData({...patientData, age: e.target.value})} required /></div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input" value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})} style={{ height: 46 }}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="form-input-icon"><Phone size={16} /><input className="form-input" value={patientData.mobile} onChange={e => setPatientData({...patientData, mobile: e.target.value})} required /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Symptoms (Optional)</label>
                  <textarea className="form-input" rows="2" placeholder="Describe symptoms..." value={patientData.symptoms} onChange={e => setPatientData({...patientData, symptoms: e.target.value})} />
                </div>
                <div className={`toggle-container ${patientData.isEmergency ? 'active' : ''}`} onClick={() => setPatientData({...patientData, isEmergency: !patientData.isEmergency})}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={20} color={patientData.isEmergency ? 'var(--danger)' : 'var(--text-light)'} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, color: patientData.isEmergency ? 'var(--danger)' : '' }}>Emergency Case?</h4>
                      <p style={{ margin: 0, fontSize: 11 }}>Gets priority in queue</p>
                    </div>
                  </div>
                  <div className={`toggle ${patientData.isEmergency ? 'active' : ''}`} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setBookingStep(1)}>Back</button>
                <button type="submit" className="btn btn-primary" style={{ background: patientData.isEmergency ? 'var(--danger)' : '' }}>
                  Generate Token
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // RENDER: Tokens List
  const renderTokens = () => {
    const myTokens = getMyTokens();
    const waiting = myTokens.filter(t => t.status === 'Waiting' || t.status === 'Called');
    const completed = myTokens.filter(t => t.status === 'Completed');
    const cancelled = myTokens.filter(t => t.status === 'Cancelled');

    return (
      <div className="fade-in">
        <h2 style={{ marginBottom: 20 }}>My Tokens</h2>

        {/* Active / Waiting Tokens */}
        {waiting.length > 0 && (
          <>
            <h4 style={{ color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={14} style={{ animation: 'pulse 1.5s infinite' }} /> Active Tokens
            </h4>
            {waiting.map(t => (
              <div key={t.id} className="card" style={{
                cursor: 'pointer',
                border: t.status === 'Called' ? '2px solid var(--secondary)' : '1px solid var(--border)',
                background: t.status === 'Called' ? 'var(--secondary-bg)' : '',
                marginBottom: 10
              }}
                onClick={() => { setSelectedTokenDetail(t); setView('tokenDetail'); }}
              >
                {t.status === 'Called' && (
                  <div style={{ background: 'var(--secondary)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                    🔔 YOUR TURN — Go to Doctor!
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 20 }}>{t.tokenNumber}</h3>
                      {t.isEmergency && <span className="badge badge-red" style={{ fontSize: 9 }}>EMERGENCY</span>}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-sub)' }}>{t.hospitalName} • {t.department}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {t.status === 'Waiting' && (
                      <>
                        <h3 style={{ margin: 0, color: 'var(--primary)' }}>{getPatientsAhead(t)}</h3>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-sub)' }}>ahead</p>
                      </>
                    )}
                    {t.status === 'Called' && <span className="badge badge-green">Called</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: 'var(--primary)' }}>Tap for live queue →</div>
              </div>
            ))}
          </>
        )}

        {waiting.length === 0 && (
          <div className="card text-center" style={{ padding: 30, marginBottom: 20 }}>
            <Stethoscope size={40} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-sub)', margin: '0 0 16px' }}>No active tokens.</p>
            <button className="btn btn-primary" style={{ width: 'auto', margin: '0 auto' }} onClick={() => { setView('hospitals'); setActiveTab('hospitals'); }}>
              Book Appointment
            </button>
          </div>
        )}

        {/* Completed Tokens */}
        {completed.length > 0 && (
          <>
            <h4 style={{ color: 'var(--secondary)', marginBottom: 10, marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Completed ({completed.length})
            </h4>
            {completed.map(t => (
              <div key={t.id} className="card" style={{ cursor: 'pointer', marginBottom: 10, padding: 14 }}
                onClick={() => { setSelectedTokenDetail(t); setView('tokenDetail'); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ margin: 0 }}>{t.tokenNumber}</h4>
                      <span className="badge badge-green">Completed</span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-sub)' }}>{t.hospitalName} • {t.department}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-sub)' }}>{timeAgo(t.completedAt || t.createdAt)}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--primary)' }}>Details →</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Cancelled Tokens */}
        {cancelled.length > 0 && (
          <>
            <h4 style={{ color: 'var(--danger)', marginBottom: 10, marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={14} /> Cancelled ({cancelled.length})
            </h4>
            {cancelled.map(t => (
              <div key={t.id} className="card" style={{ cursor: 'pointer', marginBottom: 10, padding: 14, opacity: 0.7 }}
                onClick={() => { setSelectedTokenDetail(t); setView('tokenDetail'); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{t.tokenNumber}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-sub)' }}>{t.hospitalName} • {t.department}</p>
                  </div>
                  <span className="badge badge-red">Cancelled</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  // RENDER: Token Detail — the full live queue view
  const renderTokenDetail = () => {
    const token = selectedTokenDetail;
    if (!token) {
      return (
        <div className="fade-in text-center" style={{ padding: 40 }}>
          <p>No token selected.</p>
          <button className="btn btn-primary mt-16" onClick={() => { setView('tokens'); setActiveTab('tokens'); }}>Back to Tokens</button>
        </div>
      );
    }

    const ahead = getPatientsAhead(token);
    const queue = getQueueForDept(token);
    const myIndex = queue.findIndex(t => t.id === token.id);
    const isActive = token.status === 'Waiting' || token.status === 'Called';

    return (
      <div className="fade-in">
        <button onClick={() => { setView('tokens'); setActiveTab('tokens'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--text-sub)', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Tokens
        </button>

        {/* Token Card */}
        <div className="card" style={{
          border: token.status === 'Called' ? '2px solid var(--secondary)' : token.status === 'Completed' ? '2px solid var(--secondary)' : token.isEmergency ? '2px solid var(--danger)' : '2px solid var(--primary)',
          padding: 24,
          textAlign: 'center',
          background: token.status === 'Called' ? 'var(--secondary-bg)' : ''
        }}>
          {token.status === 'Called' && (
            <div style={{ background: 'var(--secondary)', color: 'white', padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>
              🔔 YOUR TURN! Please go to the doctor now.
            </div>
          )}
          {token.isEmergency && <span className="badge badge-red" style={{ marginBottom: 8, display: 'inline-block' }}>EMERGENCY PRIORITY</span>}

          <p style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: 11, color: 'var(--text-sub)' }}>Token Number</p>
          <h1 style={{
            fontSize: 52,
            color: token.status === 'Completed' ? 'var(--secondary)' : token.status === 'Called' ? 'var(--secondary)' : token.isEmergency ? 'var(--danger)' : 'var(--primary)',
            margin: '4px 0'
          }}>{token.tokenNumber}</h1>
          <p style={{ fontWeight: 500 }}>{token.hospitalName}</p>
          <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>{token.department}</p>

          {/* Status-specific info */}
          {token.status === 'Waiting' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 20, background: '#f1f5f9', borderRadius: 12, padding: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-sub)', margin: 0 }}>Ahead</p>
                <h2 style={{ margin: 0, color: 'var(--primary)' }}>{ahead}</h2>
              </div>
              <div style={{ borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', padding: '0 8px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-sub)', margin: 0 }}>Est. Wait</p>
                <h2 style={{ margin: 0, color: 'var(--accent)' }}>{ahead * 10}m</h2>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-sub)', margin: 0 }}>Position</p>
                <h2 style={{ margin: 0 }}>#{myIndex + 1}</h2>
              </div>
            </div>
          )}

          {token.status === 'Completed' && (
            <div style={{ marginTop: 20, background: 'var(--secondary-bg)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={20} color="var(--secondary)" />
                <span style={{ fontWeight: 700, color: '#059669' }}>Visit Completed</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-sub)' }}>Booked At</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{formatTime(token.createdAt)}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-sub)' }}>Completed At</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{token.completedAt ? formatTime(token.completedAt) : 'N/A'}</p>
                </div>
                {token.calledAt && (
                  <>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-sub)' }}>Called At</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{formatTime(token.calledAt)}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-sub)' }}>Total Duration</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        {token.completedAt ? `${Math.round((new Date(token.completedAt) - new Date(token.createdAt)) / 60000)}m` : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="card" style={{ marginTop: 12 }}>
          <h4 style={{ marginBottom: 10, color: 'var(--text-sub)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <div><span style={{ color: 'var(--text-sub)' }}>Name:</span> <b>{token.patientName}</b></div>
            <div><span style={{ color: 'var(--text-sub)' }}>Age:</span> <b>{token.age}y / {token.gender}</b></div>
            <div><span style={{ color: 'var(--text-sub)' }}>Mobile:</span> <b>{token.patientMobile}</b></div>
            <div><span style={{ color: 'var(--text-sub)' }}>Booked:</span> <b>{timeAgo(token.createdAt)}</b></div>
          </div>
          {token.symptoms && (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-sub)' }}>Symptoms:</span> <b>{token.symptoms}</b>
            </div>
          )}
        </div>

        {/* LIVE QUEUE — only for active tokens */}
        {isActive && (
          <div className="card" style={{ marginTop: 12 }}>
            <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={16} color="var(--primary)" />
              Live Queue — {token.department}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-light)', fontWeight: 400 }}>Auto-refreshes</span>
            </h4>
            {queue.length === 0 ? (
              <p style={{ color: 'var(--text-sub)', fontSize: 13 }}>No patients in queue.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {queue.map((q, i) => {
                  const isMe = q.id === token.id;
                  const isCalled = q.status === 'Called';
                  return (
                    <div key={q.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: isMe ? (isCalled ? 'var(--secondary-bg)' : 'var(--primary-bg)') : isCalled ? '#f0fdf4' : '#fafbfc',
                      border: isMe ? `2px solid ${isCalled ? 'var(--secondary)' : 'var(--primary)'}` : '1px solid var(--border)',
                      fontSize: 13,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isCalled ? 'var(--secondary)' : isMe ? 'var(--primary)' : '#e2e8f0',
                        color: isCalled || isMe ? 'white' : 'var(--text-sub)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: isMe ? 700 : 500 }}>
                          {q.tokenNumber} {isMe && <span style={{ color: 'var(--primary)', fontSize: 11 }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{q.patientName}</div>
                      </div>
                      <div>
                        {isCalled && <span className="badge badge-green" style={{ fontSize: 10 }}>Called</span>}
                        {q.isEmergency && !isCalled && <span className="badge badge-red" style={{ fontSize: 10 }}>Emergency</span>}
                        {!isCalled && !q.isEmergency && q.status === 'Waiting' && <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Waiting</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // RENDER: Profile
  const renderProfile = () => {
    const myTokens = getMyTokens();
    const lastToken = myTokens.length > 0 ? myTokens[myTokens.length - 1] : null;
    const patientAge = lastToken?.age || '—';
    const patientGender = lastToken?.gender || '—';

    return (
      <div className="fade-in">
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--primary)', margin: '10px auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 36, fontWeight: 700, boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
            {user.name[0]}
          </div>
          <h2 style={{ margin: '0 0 2px' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>+91 {user.mobile}</p>
        </div>

        {/* Age & Gender Cards */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: 16, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
              <Cake size={22} color="var(--primary)" style={{ marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-sub)' }}>Age</p>
              <h3 style={{ margin: 0 }}>{patientAge}</h3>
            </div>
            <div style={{ padding: 16, textAlign: 'center' }}>
              <UserCheck size={22} color="var(--primary)" style={{ marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-sub)' }}>Gender</p>
              <h3 style={{ margin: 0 }}>{patientGender}</h3>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { icon: <History size={20} color="var(--primary)" />, label: 'Appointment History', count: myTokens.length, onClick: () => { setView('tokens'); setActiveTab('tokens'); } },
            { icon: <Globe size={20} color="var(--primary)" />, label: 'Language: English', sub: '', onClick: null },
            { icon: <Bell size={20} color="var(--primary)" />, label: 'Notifications', count: notifications.length, onClick: () => { setView('notifications'); } },
            { icon: <HelpCircle size={20} color="var(--primary)" />, label: 'Help & Support', onClick: null },
            { icon: <Settings size={20} color="var(--primary)" />, label: 'Settings', onClick: null },
          ].map((item, i) => (
            <div key={i} onClick={item.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
              cursor: item.onClick ? 'pointer' : 'default',
              transition: 'background 0.15s'
            }}>
              {item.icon}
              <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{item.count}</span>
              )}
              <ChevronRight size={16} color="var(--text-light)" />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="card mt-16" style={{ textAlign: 'left' }}>
          <h4 style={{ marginBottom: 10 }}>My Stats</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--primary-bg)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>{myTokens.length}</h3>
              <p style={{ margin: 0, fontSize: 10 }}>Total</p>
            </div>
            <div style={{ background: 'var(--secondary-bg)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary)' }}>{myTokens.filter(t => t.status === 'Completed').length}</h3>
              <p style={{ margin: 0, fontSize: 10 }}>Done</p>
            </div>
            <div style={{ background: 'var(--accent-bg)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)' }}>{myTokens.filter(t => t.status === 'Waiting').length}</h3>
              <p style={{ margin: 0, fontSize: 10 }}>Active</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className="btn mt-16" style={{ background: 'transparent', border: '1.5px solid var(--danger)', color: 'var(--danger)' }} onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    );
  };

  // RENDER: Notifications
  const renderNotifications = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => { setView('home'); setActiveTab('home'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={20} color="var(--text-main)" />
        </button>
        <h2 style={{ margin: 0 }}>Notifications</h2>
        <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{notifications.length}</span>
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center" style={{ padding: 40 }}>
          <Bell size={40} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: 'var(--text-sub)' }}>No notifications yet</h3>
          <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Book an appointment to start receiving updates.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className="card" style={{
            marginBottom: 10,
            borderLeft: `4px solid ${n.type === 'alert' ? 'var(--danger)' : n.type === 'success' ? 'var(--secondary)' : 'var(--primary)'}`,
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: n.type === 'alert' ? 'var(--danger-bg)' : n.type === 'success' ? 'var(--secondary-bg)' : 'var(--primary-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {n.type === 'alert' && <Bell size={18} color="var(--danger)" />}
                {n.type === 'success' && <CheckCircle size={18} color="var(--secondary)" />}
                {n.type === 'booking' && <Stethoscope size={18} color="var(--primary)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: 14 }}>{n.title}</h4>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{timeAgo(n.time)}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub)' }}>{n.message}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // AI Chatbot response logic
  const getBotResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('book') || lower.includes('appointment') || lower.includes('token')) {
      return '📋 To book a token:\n1. Go to Home → Book Now\n2. Select a nearby hospital\n3. Choose a department\n4. Fill in your details\n5. Click Generate Token\n\nYour token will be generated instantly!';
    }
    if (lower.includes('queue') || lower.includes('status') || lower.includes('wait')) {
      if (activeToken) {
        const ahead = getPatientsAhead(activeToken);
        return `📊 Your current queue status:\n• Token: ${activeToken.tokenNumber}\n• Hospital: ${activeToken.hospitalName}\n• Department: ${activeToken.department}\n• Patients ahead: ${ahead}\n• Estimated wait: ~${ahead * 10} minutes\n\nGo to Tokens tab to see the live queue!`;
      }
      return '📊 You don\'t have an active token right now. Book an appointment first to track your queue status!';
    }
    if (lower.includes('emergency') || lower.includes('urgent')) {
      return '🚨 For emergencies:\n1. Book a token with the Emergency toggle ON\n2. Emergency patients get priority in the queue\n3. Call hospital helpline for critical emergencies\n\nAlways visit the ER directly for life-threatening situations!';
    }
    if (lower.includes('hospital') || lower.includes('near')) {
      return '🏥 Nearby hospitals:\n• AIIMS New Delhi (2.5 km) - High crowd\n• Safdarjung Hospital (3.2 km) - Medium crowd\n• Ram Manohar Lohia (5.1 km) - Low crowd\n\nGo to Hospitals tab to see all options!';
    }
    if (lower.includes('cancel')) {
      return '❌ To cancel a token, please contact the hospital reception directly. Currently, cancellation through the app is not supported.';
    }
    if (lower.includes('help') || lower.includes('support')) {
      return '💡 I can help you with:\n• Booking appointments\n• Tracking queue status\n• Finding nearby hospitals\n• Emergency information\n• Understanding wait times\n\nJust ask me anything!';
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return `Hello ${user.name}! 😊 How can I assist you today? You can ask me about booking tokens, checking queue status, or finding hospitals.`;
    }
    if (lower.includes('thank')) {
      return 'You\'re welcome! 😊 Happy to help. Let me know if you need anything else!';
    }
    return '🤖 I can help you with:\n• "How to book?" - Booking guide\n• "Queue status" - Check your position\n• "Nearby hospitals" - Find hospitals\n• "Emergency" - Emergency info\n\nFeel free to ask!';
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: 'user', text: chatInput.trim(), time: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    // Simulate bot thinking delay
    setTimeout(() => {
      const botReply = { from: 'bot', text: getBotResponse(userMsg.text), time: new Date().toISOString() };
      setChatMessages(prev => [...prev, botReply]);
    }, 800);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // RENDER: Chatbot
  const renderChatbot = () => (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={22} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0 }}>SmartQueue AI</h3>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--secondary)' }}>● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
        {chatMessages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.from === 'user' ? 'var(--primary)' : 'var(--card-bg)',
              color: msg.from === 'user' ? 'white' : 'var(--text-main)',
              fontSize: 13,
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              border: msg.from === 'bot' ? '1px solid var(--border)' : 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              {msg.text}
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                {formatTime(msg.time)}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Replies */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 0', flexShrink: 0 }}>
        {['How to book?', 'Queue status', 'Nearby hospitals', 'Emergency help'].map(q => (
          <button key={q} onClick={() => { setChatInput(q); setTimeout(() => { setChatInput(''); const userMsg = { from: 'user', text: q, time: new Date().toISOString() }; setChatMessages(prev => [...prev, userMsg]); setTimeout(() => { setChatMessages(prev => [...prev, { from: 'bot', text: getBotResponse(q), time: new Date().toISOString() }]); }, 800); }, 50); }}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: '1px solid var(--primary)', background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleChatSend()}
          placeholder="Ask me anything..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid var(--border)', background: 'var(--card-bg)', fontSize: 14, outline: 'none' }}
        />
        <button onClick={handleChatSend} style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
        }}>
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  );

  const views = {
    home: renderHome,
    hospitals: renderHospitals,
    booking: renderBooking,
    tokens: renderTokens,
    token: renderTokens,
    tokenDetail: renderTokenDetail,
    profile: renderProfile,
    notifications: renderNotifications,
    chatbot: renderChatbot,
  };

  return (
    <div className="patient-layout">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div className="patient-content">
        {(views[view] || renderHome)()}
      </div>
      <nav className="bottom-nav">
        {[
          { key: 'home', icon: <MapPin size={22} />, label: 'Home', view: 'home' },
          { key: 'hospitals', icon: <Search size={22} />, label: 'Hospitals', view: 'hospitals' },
          { key: 'chatbot', icon: null, label: 'AI Chat', view: 'chatbot', isCenter: true },
          { key: 'tokens', icon: <Stethoscope size={22} />, label: 'Tokens', view: 'tokens' },
          { key: 'profile', icon: <User size={22} />, label: 'Profile', view: 'profile' },
        ].map(tab => (
          tab.isCenter ? (
            <button key={tab.key} className="nav-item" onClick={() => { setActiveTab(tab.key); setView(tab.view); }} style={{ position: 'relative' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: activeTab === 'chatbot' ? 'linear-gradient(135deg, var(--primary), #7c3aed)' : 'linear-gradient(135deg, var(--primary), #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -20,
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                border: '3px solid white'
              }}>
                <MessageCircle size={22} color="white" />
              </div>
              <span style={{ fontSize: 10, color: activeTab === 'chatbot' ? 'var(--primary)' : '' }}>{tab.label}</span>
            </button>
          ) : (
            <button key={tab.key} className={`nav-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => { setActiveTab(tab.key); setView(tab.view); }}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        ))}
      </nav>
    </div>
  );
};

export default PatientHome;
