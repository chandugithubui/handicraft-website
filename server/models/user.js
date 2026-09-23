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

  // Required only for normal email/password accounts
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: 6,
    default: null
  },

  // Google account identifier
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },

  // How the account was originally created
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // Google profile image
  avatar: {
    type: String,
    default: null
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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