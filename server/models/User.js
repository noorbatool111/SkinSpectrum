const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      // Not required because social logins won't have a password
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // sparse allows multiple null/undefined values
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    // Onboarding Fields
    gender: {
      type: String,
    },
    age: {
      type: String,
    },
    skinType: {
      type: String,
    },
    skinConcerns: {
      type: [String],
    },
    facialAreas: {
      type: [String],
    },
    userChallenges: {
      type: [String],
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
