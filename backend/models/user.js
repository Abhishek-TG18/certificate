const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// User Schema Definition
const UserSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpiry: {
    type: Date,
    default: null
  },
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Method to hash password before saving to database
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to check if password matches
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate a 6-digit verification code
UserSchema.methods.generateVerificationCode = function() {
  const verificationCode = crypto.randomBytes(3).toString('hex'); // Generates a random 6-digit code
  this.verificationCode = verificationCode;
  this.verificationCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
  return verificationCode;
};

// Method to validate the verification code
UserSchema.methods.validateVerificationCode = function(code) {
  return (
    this.verificationCode === code && 
    this.verificationCodeExpiry > Date.now()
  );
};

module.exports = mongoose.model('User', UserSchema);
