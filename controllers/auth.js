const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Sign up new user
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, username } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: 'Email already exists.' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      username
    });

    await user.save();

    res.status(201).json({ 
      message: 'User created successfully',
      userId: user._id
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Creating user failed.' });
    }
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed. Invalid password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.status(200).json({
      token,
      expiresIn: 86400, // 24 hours in seconds
      userId: user._id.toString(),
      user: {
        _id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Login failed.' });
    }
    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    // User is attached to request in auth middleware
    const user = req.user;
    
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Fetching profile failed.' });
    next(error);
  }
};