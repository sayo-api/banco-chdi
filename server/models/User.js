const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nomeDeGuerra: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
