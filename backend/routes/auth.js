const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ============= SIGNUP =============
router.post('/signup', async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    // Validate inputs
    if (!name || !mobile || !password) {
      return res.status(400).json({ message: 'All fields are required (name, mobile, password).' });
    }

    if (mobile.length !== 10) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(409).json({ message: 'This mobile number is already registered. Please login.' });
    }

    // Create new user (storing password directly for prototype — in production use bcrypt)
    const newUser = new User({ name, mobile, password, role: 'patient' });
    await newUser.save();

    res.status(201).json({
      message: 'Account created successfully!',
      user: { id: newUser._id, name: newUser.name, mobile: newUser.mobile, role: newUser.role }
    });

  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This mobile number is already registered.' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ============= LOGIN =============
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate inputs
    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required.' });
    }

    // Find user by mobile
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this mobile number. Please sign up first.' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    res.json({
      message: 'Login successful!',
      user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ============= GET ALL USERS (for admin) =============
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
