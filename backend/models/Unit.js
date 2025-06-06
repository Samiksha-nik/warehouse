const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitName: {
    type: String,
    required: true,
    trim: true
  },
  govtUnitCode: {
    type: String,
    trim: true,
    sparse: true
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
unitSchema.index({ unitName: 1 }, { unique: true });
unitSchema.index({ govtUnitCode: 1, sparse: true }, { unique: true });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit; 