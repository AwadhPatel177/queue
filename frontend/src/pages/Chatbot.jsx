import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, HelpCircle } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your SmartQueue Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { text: msg, isBot: false }]);
    setInput('');

    // Predefined AI responses
    setTimeout(() => {
      let response = "I'm sorry, I don't understand. Try asking about 'token', 'queue', or 'booking'.";
      const q = msg.toLowerCase();
      
      if (q.includes('token')) response = "To check your token, go to the 'Tokens' tab in the bottom bar.";
      else if (q.includes('queue')) response = "You can see real-time queue status after selecting a hospital and department.";
      else if (q.includes('help') || q.includes('book')) response = "Go to 'Hospitals' tab, select your hospital and click 'Book Appointment'.";
      else if (q.includes('emergency')) response = "For emergencies, please use the 'Emergency Toggle' in the booking form for priority.";
      
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 800);
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1>AI Health Assistant</h1>
        <p>Your local facility guide</p>
      </div>

      <div className="card" style={{ flex: 1, marginBottom: '16px', display: 'flex', flexDirection: 'column', padding: '12px', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              display: 'flex', gap: '8px', 
              alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
              flexDirection: msg.isBot ? 'row' : 'row-reverse',
              maxWidth: '85%'
            }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: msg.isBot ? '#e2e8f0' : 'var(--primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: msg.isBot ? 'var(--text-main)' : 'white'
              }}>
                {msg.isBot ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div style={{ 
                background: msg.isBot ? '#f1f5f9' : 'var(--primary)', 
                color: msg.isBot ? 'var(--text-main)' : 'white',
                padding: '10px 14px', borderRadius: msg.isBot ? '0 16px 16px 16px' : '16px 0 16px 16px',
                fontSize: '14px'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
          {['Check token', 'Check queue', 'Booking help'].map(q => (
            <button 
              key={q} 
              onClick={() => handleSend(q)}
              style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--primary)', background: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }}
            >
              <HelpCircle size={10} style={{ marginRight: '4px' }} /> {q}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          className="form-input" 
          placeholder="Type your question..." 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" style={{ width: '48px', padding: 0 }} onClick={() => handleSend()}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
