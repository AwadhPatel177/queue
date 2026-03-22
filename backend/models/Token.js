const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: { type: String, required: true },
  patientName: { type: String, required: true },
  mobile: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  symptoms: { type: String },
  isEmergency: { type: Boolean, default: false },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ['Waiting', 'Called', 'Completed', 'Missed'], default: 'Waiting' },
  queuePosition: { type: Number },
  createdAt: { type: Date, default: Date.now },
  calledAt: { type: Date },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Token', tokenSchema);
