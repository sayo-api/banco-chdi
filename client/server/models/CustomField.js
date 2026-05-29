const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['text', 'number', 'date', 'select'], default: 'text' },
  options: [{ type: String }], // for select type
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CustomField', customFieldSchema);
