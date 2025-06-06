const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  locationStock: {
    type: String
  },
  labelNumber: {
    type: String,
    required: true
  },
  qrCode: {
    type: String
  },
  assignTo: {
    type: String,
    required: true
  },
  labelDetails: {
    productName: String,
    unit: String,
    grade: String,
    length: Number,
    width: Number,
    thickness: Number,
    totalMm: Number,
    quantity: Number,
    bundleNumber: String
  },
  marketplace: {
    type: String,
    enum: ['Amazon', 'Flipkart'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema); 