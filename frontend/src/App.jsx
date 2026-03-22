import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import PatientAuth from './pages/PatientAuth';
import HospitalAuth from './pages/HospitalAuth';
import PatientHome from './pages/PatientHome';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState(null); // null, 'patient', 'hospital'

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthScreen(null);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthScreen(null);
    localStorage.removeItem('currentUser');
  };

  // If already logged in
  if (currentUser) {
    if (currentUser.role === 'hospital') {
      return <HospitalDashboard user={currentUser} onLogout={handleLogout} />;
    }
    return <PatientHome user={currentUser} onLogout={handleLogout} />;
  }

  // Auth screens
  if (authScreen === 'patient') {
    return <PatientAuth onBack={() => setAuthScreen(null)} onLogin={handleLogin} />;
  }
  if (authScreen === 'hospital') {
    return <HospitalAuth onBack={() => setAuthScreen(null)} onLogin={handleLogin} />;
  }

  // Landing page
  return (
    <LandingPage
      onPatientAuth={() => setAuthScreen('patient')}
      onHospitalAuth={() => setAuthScreen('hospital')}
    />
  );
}

export default App;
