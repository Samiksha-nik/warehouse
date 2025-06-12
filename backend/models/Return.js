const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['cancel', 'return', 'replacement'],
    required: true
  },
  onlineOrderId: {
    type: String
  },
  labelNumber: {
    type: String,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  product: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  qcImage: {
    type: String, // Path to the uploaded image
    required: true
  },
  remarks: {
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
returnSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Return', returnSchema); 