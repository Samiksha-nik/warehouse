const mongoose = require('mongoose');

const stockTransferOutwardSchema = new mongoose.Schema({
  mucNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
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
    required: false
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
    required: false
  },
  totalMm: {
    type: Number,
    required: false
  },
  quantity: {
    type: Number,
    required: true
  },
  bundleNumber: {
    type: String,
    required: false
  },
  remarks: String,
  vehicleNumber: { type: String },
  destination: { type: String },
  transporter: { type: String },
  productPhoto: { type: String },
  invoice: { type: String },
  address: { type: String },
  customerName: { type: String }
}, { timestamps: true });

stockTransferOutwardSchema.index({ mucNumber: 1 });

module.exports = mongoose.model('StockTransferOutward', stockTransferOutwardSchema); 