const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  distance: { type: String, required: true },
  crowdStatus: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  departments: [{
    name: { type: String, required: true },
    avgWaitTime: { type: Number, default: 30 } // in minutes
  }],
  coordinates: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
