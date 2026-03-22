import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobile.length === 10) setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length === 6) onLogin({ mobile });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '80px', height: '80px', background: 'var(--primary)', 
          borderRadius: '20px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 20px', color: 'white'
        }}>
          <ShieldCheck size={40} />
        </div>
        <h1>SmartQueue AI</h1>
        <p>Government Hospital Queue Management</p>
      </div>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card"
      >
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="Enter 10-digit number" 
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={mobile.length < 10}>
              Send OTP <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input 
                className="form-input" 
                placeholder="Enter 6-digit OTP" 
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
              />
              <p style={{ marginTop: '8px', fontSize: '12px' }}>A code was sent to +91 {mobile}</p>
            </div>
            <button className="btn btn-primary" type="submit" disabled={otp.length < 6}>
              Verify & Login
            </button>
            <button className="btn btn-outline" style={{ marginTop: '12px', border: 'none' }} onClick={() => setStep(1)}>
              Resend Code
            </button>
          </form>
        )}
      </motion.div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
        By logging in, you agree to our <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Terms & Privacy</span>
      </p>
    </div>
  );
};

export default Login;
