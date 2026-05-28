const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  databaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomDatabase',
    required: true,
    index: true,
  },
  data: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('DatabaseEntry', entrySchema);
