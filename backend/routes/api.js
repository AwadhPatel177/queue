const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Token = require('../models/Token');

// ── Get all hospitals ──────────────────────────────────────────────────────
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Book a token → saves to MongoDB ───────────────────────────────────────
router.post('/book', async (req, res) => {
  try {
    const { patientName, mobile, age, gender, symptoms, isEmergency, hospitalId, hospitalName, department } = req.body;

    // Find hospital: try ObjectId first, then name
    let hospital = null;
    if (hospitalId && mongoose.Types.ObjectId.isValid(hospitalId)) {
      hospital = await Hospital.findById(hospitalId);
    }
    if (!hospital && hospitalName) {
      hospital = await Hospital.findOne({ name: hospitalName });
    }
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found. Make sure backend seeds are running.' });
    }

    // Auto-generate token number
    const count = await Token.countDocuments({ hospital: hospital._id, department });
    const tokenNumber = `${department.substring(0, 3).toUpperCase()}-${count + 101}`;

    const newToken = new Token({
      tokenNumber,
      patientName,
      mobile,
      age: Number(age),
      gender,
      symptoms,
      isEmergency: Boolean(isEmergency),
      hospital: hospital._id,
      department,
      queuePosition: isEmergency ? 1 : count + 1
    });

    await newToken.save();
    const populated = await newToken.populate('hospital', 'name');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Book token error:', err);
    res.status(400).json({ message: err.message });
  }
});

// ── Get ALL tokens (filter by ?hospitalName=...) ───────────────────────────
router.get('/tokens', async (req, res) => {
  try {
    let query = {};
    if (req.query.hospitalName) {
      const hospital = await Hospital.findOne({ name: req.query.hospitalName });
      if (hospital) query.hospital = hospital._id;
    }
    const tokens = await Token.find(query).populate('hospital', 'name').sort({ createdAt: -1 });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update token status (Called / Completed / Missed) ─────────────────────
router.patch('/token/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Waiting', 'Called', 'Completed', 'Missed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const update = { status };
    if (status === 'Called')    update.calledAt    = new Date();
    if (status === 'Completed') update.completedAt = new Date();

    const token = await Token.findByIdAndUpdate(req.params.id, update, { new: true }).populate('hospital', 'name');
    if (!token) return res.status(404).json({ message: 'Token not found' });
    res.json(token);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── Get single token details ───────────────────────────────────────────────
router.get('/token/:id', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id).populate('hospital');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    const ahead = await Token.countDocuments({
      hospital: token.hospital._id,
      department: token.department,
      status: 'Waiting',
      createdAt: { $lt: token.createdAt }
    });

    res.json({
      token,
      patientsAhead: ahead,
      estimatedWaitTime: ahead * 10
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get queue for a department ─────────────────────────────────────────────
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
