const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  pages: {
    dashboard: { type: Boolean, default: false },
    soldiers: { type: Boolean, default: false },
    databases: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
