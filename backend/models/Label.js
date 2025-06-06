const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
  labelNumber: {
    type: String,
    unique: true
  },
  inventoryType: {
    type: String,
    required: true,
    enum: ['Billing', 'Non-Billing']
  },
  productName: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  gradeValue: {
    type: String,
    required: true,
    ref: 'Grade'
  },
  length: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  thickness: {
    type: Number,
    required: true
  },
  totalMM: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  bundleNumber: {
    type: String,
    required: true
  },
  remark: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique label number before saving
labelSchema.pre('save', async function(next) {
  try {
    if (!this.labelNumber) { // Only set if not already set
      const count = await mongoose.model('Label').countDocuments();
      const sequence = (5000 + count + 1).toString(); // Start from 5001
      this.labelNumber = sequence;
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Label', labelSchema); 