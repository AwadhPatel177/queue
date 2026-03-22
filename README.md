# AI Smart Queue Management System for Government Hospitals

A full-stack MERN prototype for a modern, mobile-first hospital queue management system.

## Features
- **Simulated OTP Login**: Secure login with mobile number.
- **Nearest Hospitals**: Automatically detect and list nearby facilities.
- **Smart Booking**: Department selection and case-based priority (Emergency toggle).
- **Token System**: Live tracking, patients ahead, and estimated wait time.
- **Doctor Dashboard**: Real-time queue management for medical staff.
- **Analytics Dashboard**: Insights into patient flow and waiting times using charts.
- **AI Chatbot**: Intelligent assistant for FAQs and queue support.
- **Emergency Priority**: Red-highlighted priority for critical patients.
- **Missed Token Recovery**: Alert and recovery options if a token is missed.

## Tech Stack
- **Frontend**: React.js, Vite, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Styling**: Vanilla CSS (Custom Healthcare Design System).

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running locally OR a MongoDB Atlas URI.

### Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install`.
3. Start the server: `npm run dev` (or `node index.js`).
   - The server will run on [http://localhost:5000](http://localhost:5000).
   - Dummy hospital data will be seeded automatically on first run.

### Frontend Setup
1. Open a terminal in the `frontend` folder.
2. Run `npm install`.
3. Start the app: `npm run dev`.
4. Open the link provided (usually [http://localhost:5173](http://localhost:5173)).

## Demo Flow
1. **Login**: Enter any 10-digit mobile and any 6-digit OTP.
2. **Book**: Select a hospital -> Choose Department -> Fill details -> Toggle Emergency if needed.
3. **Track**: Monitor your token status and wait for simulated notifications.
4. **Stats**: Check the Analytics tab for system-wide performance.
5. **Doctor**: Visit `/doctor` route to simulate calling patients from the queue.

---
Built for Hackathons. Prototype ready.
