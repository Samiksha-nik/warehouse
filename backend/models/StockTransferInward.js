const mongoose = require('mongoose');

const stockTransferInwardSchema = new mongoose.Schema({
  mucNumber: { type: String },
  inwardNumber: { type: String },
  date: {
    type: Date,
    required: true
  },
  fromLocation: {
    type: String,
    required: true
  },
  toLocation: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
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
  totalMm: {
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
  remarks: String,
  vehicleNumber: { type: String },
  destination: { type: String },
  transporter: { type: String },
  productPhoto: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('StockTransferInward', stockTransferInwardSchema, 'stocktransferinward'); 