import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Users, PlayCircle, SkipForward, CheckCircle, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const [queue, setQueue] = useState([
    { id: 1, name: 'John Doe', token: 'OPD-105', symptoms: 'Fever & Cough', isEmergency: true },
    { id: 2, name: 'Sarah Smith', token: 'OPD-106', symptoms: 'Back Pain', isEmergency: false },
    { id: 3, name: 'Mike Johnson', token: 'OPD-107', symptoms: 'Eye Infection', isEmergency: false },
    { id: 4, name: 'Emma Wilson', token: 'OPD-108', symptoms: 'Headache', isEmergency: false }
  ]);

  const [currentPatient, setCurrentPatient] = useState(null);

  const callNext = () => {
    if (queue.length > 0) {
      const next = queue[0];
      setCurrentPatient(next);
      setQueue(queue.slice(1));
    }
  };

  const markComplete = () => {
    setCurrentPatient(null);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1>Doctor Dashboard</h1>
        <p>OPD - General Medicine</p>
      </div>

      {currentPatient ? (
        <div className="card" style={{ border: currentPatient.isEmergency ? '2px solid var(--danger)' : '2px solid var(--primary)', background: '#f0f9ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="badge badge-yellow">Current Patient</span>
            {currentPatient.isEmergency && <span className="badge badge-red">Emergency</span>}
          </div>
          <h2 style={{ fontSize: '28px' }}>{currentPatient.name}</h2>
          <p style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '700' }}>Token: {currentPatient.token}</p>
          <div style={{ marginTop: '12px', background: 'white', padding: '12px', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>Symptoms:</p>
            <p style={{ margin: 0 }}>{currentPatient.symptoms}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={markComplete} style={{ background: 'var(--secondary)' }}>
              <CheckCircle size={18} /> Mark Completed
            </button>
            <button className="btn btn-outline" style={{ border: 'none' }}>
              <SkipForward size={18} /> No Show
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ color: 'var(--text-sub)', marginBottom: '16px' }}>
            <UserCheck size={48} style={{ opacity: 0.3 }} />
          </div>
          <h3>No patient in cabin</h3>
          <p style={{ marginBottom: '24px' }}>Queue length: {queue.length} patients waiting</p>
          <button className="btn btn-primary" onClick={callNext} disabled={queue.length === 0}>
            Call Next Patient
          </button>
        </div>
      )}

      <h3 style={{ marginTop: '30px', marginBottom: '16px' }}>Next in Queue ({queue.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {queue.map(p => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="card" 
              style={{ marginBottom: 0, padding: '12px', border: p.isEmergency ? '1px solid var(--danger)' : '' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: p.isEmergency ? 'var(--danger)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.isEmergency ? 'white' : 'var(--text-sub)' }}>
                    {p.isEmergency ? <AlertCircle size={18} /> : <span>{p.token.split('-')[1]}</span>}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                    <p style={{ margin: 0, fontSize: '11px' }}>{p.token}</p>
                  </div>
                </div>
                {p.isEmergency && <span className="badge badge-red" style={{ fontSize: '8px' }}>Emergency</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoctorDashboard;
