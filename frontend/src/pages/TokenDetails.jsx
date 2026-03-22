import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenCard from '../components/TokenCard';
import { Bell, ArrowLeft, MoreVertical, RefreshCw, AlertTriangle } from 'lucide-react';

const TokenDetails = ({ tokenData, onBack }) => {
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMissedAlert, setShowMissedAlert] = useState(false);

  useEffect(() => {
    // Simulate smart notifications
    const timers = [
      setTimeout(() => setNotification("Doctor is now available for your department!"), 5000),
      setTimeout(() => setNotification("Please reach hospital in 15 minutes."), 10000),
      // Simulate missing the token
      setTimeout(() => setShowMissedAlert(true), 15000)
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h3>Your Appointment</h3>
        <MoreVertical size={20} color="var(--text-sub)" />
      </div>

      <AnimatePresence>
        {showMissedAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal-overlay"
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.5)', zIndex: 2000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="card" 
              style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '30px' }}
            >
              <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>
                <AlertTriangle size={60} />
              </div>
              <h2>Token Missed!</h2>
              <p>Your token number <b>{tokenData.tokenNumber}</b> was called 5 minutes ago.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={() => setShowMissedAlert(false)}>
                  Join Now (Immediate)
                </button>
                <button className="btn btn-outline" onClick={() => { setShowMissedAlert(false); handleRefresh(); }}>
                  Wait Again (Move to end)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ 
              background: 'var(--primary)', color: 'white', 
              padding: '12px 16px', borderRadius: '12px', 
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' 
            }}
          >
            <Bell size={20} className="blink" />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{notification}</span>
            <button onClick={() => setNotification(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', color: 'white', fontSize: '18px' }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <TokenCard 
        token={tokenData} 
        patientsAhead={8} 
        estimatedWaitTime={45} 
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <button 
          onClick={handleRefresh}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', border: 'none', 
            background: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '13px', 
            cursor: 'pointer' 
          }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
          {isRefreshing ? 'Updating...' : 'Refresh Status'}
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Instructions</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
          {[
            "Carry your Aadhar card or Govt ID.",
            "Mask is mandatory inside premises.",
            "Report to counter 15 mins before call.",
            "Follow the red indicators for Emergency."
          ].map((text, i) => (
            <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
              <p style={{ margin: 0, fontSize: '13px' }}>{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .blink { animation: blinker 1.5s linear infinite; }
        @keyframes blinker { 50% { opacity: 0; } }
        .spin { animation: spinner 1s linear infinite; }
        @keyframes spinner { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TokenDetails;
