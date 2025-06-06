const mongoose = require('mongoose');

const hsnSchema = new mongoose.Schema({
  hsnCode: {
    type: String,
    required: true,
    trim: true
  },
  sgst: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  cgst: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  igst: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add index for faster queries and uniqueness
hsnSchema.index({ hsnCode: 1 }, { unique: true });

const HSN = mongoose.model('HSN', hsnSchema);

module.exports = HSN; 