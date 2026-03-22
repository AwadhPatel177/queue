import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';

const TokenCard = ({ token, patientsAhead, estimatedWaitTime }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card ${token.isEmergency ? 'emergency-glow' : ''}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {token.isEmergency && (
        <div style={{ 
          position: 'absolute', top: 0, right: 0, 
          background: 'var(--danger)', color: 'white', 
          padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', 
          borderBottomLeftRadius: '12px' 
        }}>
          EMERGENCY PRIORITY
        </div>
      )}
      
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', fontSize: '12px' }}>Your Token Number</p>
        <h1 style={{ fontSize: '48px', color: token.isEmergency ? 'var(--danger)' : 'var(--primary)', margin: '8px 0' }}>{token.tokenNumber}</h1>
        <p style={{ fontWeight: '500' }}>{token.department}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', background: '#f1f5f9', borderRadius: '12px', padding: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px' }}>Patients Ahead</p>
          <h2 style={{ margin: 0 }}>{patientsAhead}</h2>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #cbd5e1' }}>
          <p style={{ fontSize: '12px' }}>Est. Wait Time</p>
          <h2 style={{ margin: 0 }}>{estimatedWaitTime} <span style={{ fontSize: '12px' }}>mins</span></h2>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', background: '#ecfdf5', padding: '10px', borderRadius: '8px', color: '#065f46' }}>
          <AlertCircle size={18} />
          <p style={{ color: 'inherit', fontSize: '13px', margin: 0 }}>Current Token: <b>OPD-102</b></p>
        </div>
        <button className="btn btn-primary" style={{ gap: '12px' }}>
          Live Queue Tracking <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default TokenCard;
