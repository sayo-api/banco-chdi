const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  key:      { type: String, required: true, trim: true },
  label:    { type: String, required: true, trim: true },
  type:     { type: String, enum: ['text','number','date','select'], default: 'text' },
  options:  [{ type: String }],
  required: { type: Boolean, default: false },
  width:    { type: Number, default: 150 },
  order:    { type: Number, default: 0 },
}, { _id: true });

const customDatabaseSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  icon:        { type: String, default: '📦' },
  color:       { type: String, default: '#8B0D20' },
  columns:     [columnSchema],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('CustomDatabase', customDatabaseSchema);
