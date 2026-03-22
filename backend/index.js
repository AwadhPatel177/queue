require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const Hospital = require('./models/Hospital');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => res.send('AI Smart Queue API is running'));

// Seed dummy data if needed
const seedData = async () => {
  const count = await Hospital.countDocuments();
  if (count === 0) {
    await Hospital.create([
      {
        name: "AIIMS New Delhi",
        address: "Ansari Nagar, New Delhi",
        distance: "2.5 km",
        crowdStatus: "High",
        departments: [
          { name: "General OPD", avgWaitTime: 45 },
          { name: "Dental", avgWaitTime: 30 },
          { name: "Eye (Ophthalmology)", avgWaitTime: 20 },
          { name: "Cardiology", avgWaitTime: 60 }
        ]
      },
      {
        name: "Safdarjung Hospital",
        address: "Ansari Nagar East, New Delhi",
        distance: "3.2 km",
        crowdStatus: "Medium",
        departments: [
          { name: "General OPD", avgWaitTime: 35 },
          { name: "Pediatrics", avgWaitTime: 25 },
          { name: "Orthopedics", avgWaitTime: 40 }
        ]
      },
      {
        name: "Ram Manohar Lohia Hospital",
        address: "Baba Kharak Singh Marg, New Delhi",
        distance: "5.1 km",
        crowdStatus: "Low",
        departments: [
          { name: "General OPD", avgWaitTime: 15 },
          { name: "ENT", avgWaitTime: 10 }
        ]
      }
    ]);
    console.log("Dummy hospital data seeded!");
  }
};

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://awadhpatel177_db_user:4eeDuXoUDsciSy2N@cluster0.c4wkfum.mongodb.net/?appName=Cluster0';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedData();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
