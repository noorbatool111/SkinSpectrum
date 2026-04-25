const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
// const axios = require('axios'); // for Facebook if needed
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route POST /api/auth/signup
// @desc Register user with email and password
router.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body.email);
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns,
        facialAreas: user.facialAreas,
        isOnboardingComplete: user.isOnboardingComplete,
      },
    });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    res.status(500).json({ 
      message: 'Server error', 
      debug: err.message,
      stack: err.stack 
    });
  }
});

// @route POST /api/auth/login
// @desc Login user with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (!user.password) {
      return res.status(400).json({ message: 'Please login using the social account you registered with.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns,
        facialAreas: user.facialAreas,
        isOnboardingComplete: user.isOnboardingComplete,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route POST /api/auth/social/google
// @desc Authenticate with Google ID Token
router.post('/social/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID if user already exists with email
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns,
        facialAreas: user.facialAreas,
        isOnboardingComplete: user.isOnboardingComplete,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
});

// @route POST /api/auth/social/facebook
// @desc Authenticate with Facebook Access Token
router.post('/social/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    // Need to use node-fetch or axios to hit facebook graph API
    const axios = require('axios');
    const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    
    const { name, id: facebookId } = data;
    const email = data.email || null;
    const picture = data.picture?.data?.url;
    
    // Try to find user by facebookId first, then by email
    let user = await User.findOne({ facebookId });
    
    if (!user && email) {
      user = await User.findOne({ email });
    }
    
    if (!user) {
      // Create new user — use email if available, otherwise generate a placeholder
      user = new User({
        name: name || 'Facebook User',
        email: email || `fb_${facebookId}@facebook.placeholder`,
        facebookId,
        avatar: picture,
      });
      await user.save();
    } else if (!user.facebookId) {
      user.facebookId = facebookId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns,
        facialAreas: user.facialAreas,
        isOnboardingComplete: user.isOnboardingComplete,
      },
    });
  } catch (err) {
    console.error('Facebook Auth Error:', err.message);
    res.status(401).json({ message: 'Invalid Facebook Token' });
  }
});

// @route GET /api/auth/me
// @desc Get current logged in user profile
router.get('/me', auth, async (req, res) => {
  try {
    // User is attached by the auth middleware
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/auth/profile
// @desc Update user profile data (onboarding steps)
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      name,
      gender,
      age,
      skinType,
      skinConcerns,
      facialAreas,
      userChallenges,
      isOnboardingComplete
    } = req.body;

    // Build profile object dynamically
    const profileFields = {};
    if (name !== undefined) profileFields.name = name;
    if (gender !== undefined) profileFields.gender = gender;
    if (age !== undefined) profileFields.age = age;
    if (skinType !== undefined) profileFields.skinType = skinType;
    if (skinConcerns) profileFields.skinConcerns = skinConcerns;
    if (facialAreas) profileFields.facialAreas = facialAreas;
    if (userChallenges) profileFields.userChallenges = userChallenges;
    if (isOnboardingComplete !== undefined) profileFields.isOnboardingComplete = isOnboardingComplete;

    let user = await User.findById(req.user.id);

    if (user) {
      // Update
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');
      return res.json(user);
    }
    
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
