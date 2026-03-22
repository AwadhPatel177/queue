import React, { useState } from 'react';
import { ArrowLeft, Hospital, Lock, ArrowRight, Building } from 'lucide-react';

const DUMMY_HOSPITALS = [
  { id: 'h1', name: 'AIIMS New Delhi', code: 'AIIMS001', password: 'admin123' },
  { id: 'h2', name: 'Safdarjung Hospital', code: 'SAFDAR01', password: 'admin123' },
  { id: 'h3', name: 'Ram Manohar Lohia Hospital', code: 'RML001', password: 'admin123' },
];

const HospitalAuth = ({ onBack, onLogin }) => {
  const [hospitalCode, setHospitalCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const hospital = DUMMY_HOSPITALS.find(h => h.code === hospitalCode && h.password === password);
    if (hospital) {
      const user = { id: hospital.id, name: hospital.name, code: hospital.code, role: 'hospital' };
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } else {
      setError('Invalid Hospital Code or Password. Try AIIMS001 / admin123');
    }
  };

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <button onClick={onBack} style={{ position: 'absolute', left: 20, top: 20, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, cursor: 'pointer', display: 'flex' }}>
        <ArrowLeft size={20} />
      </button>

      <div className="auth-container fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-icon" style={{ background: 'var(--secondary)' }}>
            <Hospital size={30} />
          </div>
          <h2>Hospital Portal</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Manage queues & view patient data</p>
        </div>

        <div className="auth-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Hospital Code</label>
              <div className="form-input-icon">
                <Building size={18} />
                <input className="form-input" placeholder="e.g., AIIMS001" value={hospitalCode} onChange={e => setHospitalCode(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Password</label>
              <div className="form-input-icon">
                <Lock size={18} />
                <input className="form-input" placeholder="Enter admin password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button className="btn btn-secondary" type="submit">
              Login to Dashboard <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: 24, background: '#f8fafc', borderRadius: 10, padding: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-sub)' }}>DEMO CREDENTIALS</p>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><b>AIIMS:</b> AIIMS001 / admin123</div>
              <div><b>Safdarjung:</b> SAFDAR01 / admin123</div>
              <div><b>RML:</b> RML001 / admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalAuth;
