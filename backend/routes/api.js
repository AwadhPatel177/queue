const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Token = require('../models/Token');

// Get all hospitals
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Book a token
router.post('/book', async (req, res) => {
  try {
    const { patientName, mobile, age, gender, symptoms, isEmergency, hospitalId, department } = req.body;
    
    // Calculate token number (simple logic for now)
    const count = await Token.countDocuments({ hospital: hospitalId, department });
    const tokenNumber = `${department[0].toUpperCase()}-${count + 101}`;
    
    const newToken = new Token({
      tokenNumber,
      patientName,
      mobile,
      age,
      gender,
      symptoms,
      isEmergency,
      hospital: hospitalId,
      department,
      queuePosition: isEmergency ? 1 : count + 1 // Simple priority: emergency gets pos 1
    });

    // If emergency, we should ideally shift others, but for prototype, we'll just mark it
    await newToken.save();
    res.status(201).json(newToken);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get token status
router.get('/token/:id', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id).populate('hospital');
    if (!token) return res.status(404).json({ message: 'Token not found' });
    
    // Simple logic for "patients ahead"
    const ahead = await Token.countDocuments({
      hospital: token.hospital._id,
      department: token.department,
      status: 'Waiting',
      createdAt: { $lt: token.createdAt }
    });

    res.json({
      token,
      patientsAhead: ahead,
      estimatedWaitTime: ahead * 10 // 10 mins per patient
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get queue status for a department
router.get('/queue/:hospitalId/:department', async (req, res) => {
  try {
    const tokens = await Token.find({
      hospital: req.params.hospitalId,
      department: req.params.department,
      status: { $in: ['Waiting', 'Called'] }
    }).sort({ isEmergency: -1, createdAt: 1 });

    const currentToken = await Token.findOne({
      hospital: req.params.hospitalId,
      department: req.params.department,
      status: 'Called'
    });

    res.json({
      tokens,
      currentToken: currentToken || (tokens.length > 0 ? tokens[0] : null)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
