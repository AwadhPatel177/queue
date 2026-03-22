import React from 'react';
import { ShieldCheck, Hospital, ArrowRight, Users, Clock, Activity } from 'lucide-react';

const LandingPage = ({ onPatientAuth, onHospitalAuth }) => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <ShieldCheck size={22} color="white" />
          </div>
          SmartQueue AI
        </div>
      </nav>

      <div className="landing-hero">
        <h1>
          AI-Powered <span>Smart Queue</span><br />
          for Government Hospitals
        </h1>
        <p>
          Skip the lines. Book your token online, track your queue in real-time, and get notified when it's your turn.
        </p>

        <div className="landing-cards">
          <div className="landing-card" onClick={onPatientAuth}>
            <div className="landing-card-icon" style={{ background: 'rgba(37,99,235,0.15)' }}>
              <Users size={28} color="#60a5fa" />
            </div>
            <h3>Patient Login</h3>
            <p>Book appointments, track tokens, and get smart notifications.</p>
            <button className="card-btn" style={{ background: 'var(--primary)', color: 'white' }}>
              Continue as Patient <ArrowRight size={16} />
            </button>
          </div>

          <div className="landing-card" onClick={onHospitalAuth}>
            <div className="landing-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Hospital size={28} color="#34d399" />
            </div>
            <h3>Hospital Login</h3>
            <p>Manage queues, view analytics, and call patients from dashboard.</p>
            <button className="card-btn" style={{ background: 'var(--secondary)', color: 'white' }}>
              Continue as Hospital <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="landing-stats">
        <div className="landing-stat">
          <h3>50+</h3>
          <p>Hospitals Connected</p>
        </div>
        <div className="landing-stat">
          <h3>10,000+</h3>
          <p>Tokens Generated</p>
        </div>
        <div className="landing-stat">
          <h3>45%</h3>
          <p>Wait Time Reduced</p>
        </div>
        <div className="landing-stat">
          <h3>4.8★</h3>
          <p>Patient Rating</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
