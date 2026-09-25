const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: false,
    default: null,
    minlength: 6
  },

  avatar: {
    type: String,
    default: null
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  googleId: {
    type: String,
    default: null,
    sparse: true,
    unique: true
  },

  authProviders: {
    type: [String],
    enum: ['local', 'google'],
    default: ['local']
  },

  refreshTokens: {
    type: Array,
    default: []
  },

  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpires: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);