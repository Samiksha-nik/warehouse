const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
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

// Update the updatedAt timestamp before saving
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema); 