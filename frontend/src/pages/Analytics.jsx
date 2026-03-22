import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, Clock, Zap, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const hourlyData = [
    { hour: '8am', count: 12 }, { hour: '10am', count: 45 }, { hour: '12pm', count: 78 },
    { hour: '2pm', count: 62 }, { hour: '4pm', count: 35 }, { hour: '6pm', count: 20 }
  ];

  const waitTimeData = [
    { day: 'Mon', time: 45 }, { day: 'Tue', time: 52 }, { day: 'Wed', time: 38 },
    { day: 'Thu', time: 65 }, { day: 'Fri', time: 42 }, { day: 'Sat', time: 30 }
  ];

  const stats = [
    { label: 'Total Patients', value: '1,280', icon: <Users size={20} />, color: 'var(--primary)' },
    { label: 'Avg Wait Time', value: '42m', icon: <Clock size={20} />, color: 'var(--accent)' },
    { label: 'Peak Hour', value: '12:30 PM', icon: <TrendingUp size={20} />, color: 'var(--danger)' },
    { label: 'Satisfaction', value: '94%', icon: <Zap size={20} />, color: 'var(--secondary)' }
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1>Hospital Analytics</h1>
        <p>Queue performance insights</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '12px', marginBottom: 0 }}>
            <div style={{ color: s.color, marginBottom: '8px' }}>{s.icon}</div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>{s.value}</h3>
            <p style={{ fontSize: '11px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Patient Inflow (Hourly)</h3>
        <p style={{ marginBottom: '20px' }}>Current day statistics</p>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)'}} />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Avg Waiting Time (Daily)</h3>
        <p style={{ marginBottom: '20px' }}>Weekly trend analysis</p>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waitTimeData}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)'}}/>
              <Area type="monotone" dataKey="time" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTime)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
