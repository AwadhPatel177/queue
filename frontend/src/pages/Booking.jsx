import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft, Stethoscope, AlertTriangle, User, Calendar, Phone } from 'lucide-react';

const Booking = ({ hospital, onBack, onBook }) => {
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState('');
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    mobile: '',
    symptoms: '',
    isEmergency: false
  });

  const departments = [
    { name: 'General OPD', icon: <Stethoscope size={20} /> },
    { name: 'Dental', icon: <Stethoscope size={20} /> },
    { name: 'Eye (Ophthalmology)', icon: <Stethoscope size={20} /> },
    { name: 'Cardiology', icon: <Stethoscope size={20} /> },
    { name: 'Pediatrics', icon: <Stethoscope size={20} /> }
  ];

  const handleNext = () => {
    if (department) setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({ ...patientData, department, hospitalId: hospital.id });
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ marginBottom: 0 }}>{hospital.name}</h1>
          <p style={{ margin: 0 }}>Booking Appointment</p>
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {step === 1 ? (
          <div>
            <h3>Select Department</h3>
            <p style={{ marginBottom: '16px' }}>Choose the department you need to visit</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {departments.map(dept => (
                <div 
                  key={dept.name}
                  onClick={() => setDepartment(dept.name)}
                  className={`card ${department === dept.name ? 'active-border' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', marginBottom: 0, border: department === dept.name ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    {dept.icon}
                  </div>
                  <span style={{ flex: 1, fontWeight: '500' }}>{dept.name}</span>
                  <ChevronRight size={18} color="var(--text-sub)" />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '24px' }} disabled={!department} onClick={handleNext}>
              Continue to Patient Details
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Patient Details</h3>
            <p style={{ marginBottom: '20px' }}>Fill in the details for {department}</p>
            
            <div className="card" style={{ padding: '20px', border: patientData.isEmergency ? '2px solid var(--danger)' : '' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-sub)' }} />
                  <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Enter name" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-sub)' }} />
                    <input className="form-input" style={{ paddingLeft: '36px' }} type="number" placeholder="Age" value={patientData.age} onChange={e => setPatientData({...patientData, age: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-sub)' }} />
                  <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Mobile number" value={patientData.mobile} onChange={e => setPatientData({...patientData, mobile: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms (Optional)</label>
                <textarea className="form-input" rows="3" placeholder="Briefly describe your symptoms..." value={patientData.symptoms} onChange={e => setPatientData({...patientData, symptoms: e.target.value})} />
              </div>

              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                background: patientData.isEmergency ? '#fee2e2' : '#f8fafc', 
                padding: '12px', borderRadius: '12px', border: patientData.isEmergency ? '1px solid #ef4444' : '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color={patientData.isEmergency ? 'var(--danger)' : 'var(--text-sub)'} />
                  <div>
                    <h3 style={{ margin: 0, color: patientData.isEmergency ? 'var(--danger)' : '' }}>Emergency?</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: patientData.isEmergency ? '#991b1b' : '' }}>Priority for critical cases</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }} 
                  checked={patientData.isEmergency}
                  onChange={e => setPatientData({...patientData, isEmergency: e.target.checked})}
                />
              </div>
            </div>

            <button className={`btn ${patientData.isEmergency ? 'btn-primary' : 'btn-primary'}`} style={{ background: patientData.isEmergency ? 'var(--danger)' : '' }} type="submit">
              Generate Token
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Booking;
