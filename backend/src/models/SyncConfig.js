const mongoose = require('mongoose');

const SyncConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sheetId: {
    type: String,
    required: true
  },
  sheetName: {
    type: String,
    required: true
  },
  tabName: {
    type: String,
    required: true
  },
  localPath: {
    type: String,
    required: true
  },
  syncInterval: {
    type: Number, // in minutes
    required: true,
    min: 5 // minimum 5 minutes
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSyncTime: {
    type: Date
  },
  lastSyncStatus: {
    type: String,
    enum: ['success', 'failed', 'pending', null],
    default: null
  },
  lastSyncError: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SyncConfig', SyncConfigSchema);
