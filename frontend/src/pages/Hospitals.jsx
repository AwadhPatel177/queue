import React, { useState, useEffect } from 'react';
import HospitalCard from '../components/HospitalCard';
import { Search, Filter, MapPin } from 'lucide-react';

const Hospitals = ({ onSelectHospital }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, fetch from API. Here we use dummy data for speed.
    const dummyHospitals = [
      {
        id: '1',
        name: "AIIMS New Delhi",
        address: "Ansari Nagar, New Delhi",
        distance: "2.5 km",
        crowdStatus: "High",
        departments: [{ name: "General OPD", avgWaitTime: 45 }]
      },
      {
        id: '2',
        name: "Safdarjung Hospital",
        address: "Ansari Nagar East, New Delhi",
        distance: "3.2 km",
        crowdStatus: "Medium",
        departments: [{ name: "General OPD", avgWaitTime: 35 }]
      },
      {
        id: '3',
        name: "Ram Manohar Lohia Hospital",
        address: "Baba Kharak Singh Marg, New Delhi",
        distance: "5.1 km",
        crowdStatus: "Low",
        departments: [{ name: "General OPD", avgWaitTime: 15 }]
      }
    ];
    
    // Simulate API delay
    const timer = setTimeout(() => {
      setHospitals(dummyHospitals);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin color="var(--primary)" /> Nearby Hospitals
        </h1>
        <p>Select a hospital to check queue status</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
        <input 
          className="form-input" 
          style={{ paddingLeft: '40px' }} 
          placeholder="Search by name or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        <span className="badge badge-green">Low Crowd</span>
        <span className="badge badge-yellow">Nearest</span>
        <span className="badge badge-yellow">General OPD</span>
        <span className="badge badge-yellow">Dental</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loader" style={{ margin: '0 auto 12px' }}></div>
          <p>Finding hospitals near you...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredHospitals.map(h => (
            <HospitalCard key={h.id} hospital={h} onClick={onSelectHospital} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hospitals;
