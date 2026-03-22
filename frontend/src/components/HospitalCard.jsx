import React from 'react';
import { MapPin, Users, Clock, Navigation } from 'lucide-react';

const HospitalCard = ({ hospital, onClick }) => {
  const getCrowdColor = (status) => {
    switch (status) {
      case 'Low': return 'badge-green';
      case 'Medium': return 'badge-yellow';
      case 'High': return 'badge-red';
      default: return 'badge-yellow';
    }
  };

  return (
    <div className="card fade-in" onClick={() => onClick(hospital)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>{hospital.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-sub)', fontSize: '13px' }}>
            <MapPin size={14} />
            <span>{hospital.address}</span>
          </div>
        </div>
        <span className={`badge ${getCrowdColor(hospital.crowdStatus)}`}>
          {hospital.crowdStatus} Crowd
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Navigation size={16} color="var(--primary)" />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{hospital.distance}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="var(--accent)" />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>~{hospital.departments[0]?.avgWaitTime}m wait</span>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
