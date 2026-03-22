import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth' || 'https://smartqueueai.vercel.app/api/auth';

const PatientAuth = ({ onBack, onLogin }) => {
  const [tab, setTab] = useState('signup'); // Default to signup so user creates account first
  const [formData, setFormData] = useState({ name: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        // ====== SIGNUP ======
        if (!formData.name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (formData.mobile.length !== 10) {
          setError('Mobile number must be exactly 10 digits.');
          setLoading(false);
          return;
        }
        if (formData.password.length < 4) {
          setError('Password must be at least 4 characters.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, mobile: formData.mobile, password: formData.password })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Signup failed. Please try again.');
          setLoading(false);
          return;
        }

        // Signup success — show message and switch to login
        setSuccess('Account created! Please login now.');
        setTab('login');
        setFormData({ ...formData, name: '' }); // Keep mobile & password for convenience
        setLoading(false);

      } else {
        // ====== LOGIN ======
        if (formData.mobile.length !== 10) {
          setError('Mobile number must be exactly 10 digits.');
          setLoading(false);
          return;
        }
        if (!formData.password) {
          setError('Please enter your password.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: formData.mobile, password: formData.password })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Login failed. Please try again.');
          setLoading(false);
          return;
        }

        // Login success — store user and navigate
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Cannot connect to server. Make sure backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <button onClick={onBack} style={{ position: 'absolute', left: 20, top: 20, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, cursor: 'pointer', display: 'flex' }}>
        <ArrowLeft size={20} />
      </button>

      <div className="auth-container fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-icon" style={{ background: 'var(--primary)' }}>
            <User size={30} />
          </div>
          <h2>Patient Portal</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Book tokens & track your queue</p>
        </div>

        <div className="auth-form">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>Login</button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>Sign Up</button>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{ background: 'var(--secondary-bg)', color: '#059669', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-icon">
                  <User size={18} />
                  <input className="form-input" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div className="form-input-icon">
                <Phone size={18} />
                <input className="form-input" placeholder="Enter 10-digit mobile" type="tel" maxLength={10} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <Lock size={18} />
                <input className="form-input" placeholder={tab === 'signup' ? 'Create a password (min 4 chars)' : 'Enter your password'} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
            </div>

            <button className="btn btn-primary mt-8" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait...' : (tab === 'login' ? 'Login' : 'Create Account')} {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-sub)' }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}>
              {tab === 'login' ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientAuth;
