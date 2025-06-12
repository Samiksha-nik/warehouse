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
    required: false
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  remarks: String,
  status: {
    type: String,
    enum: ['Pending', 'In Transit', 'Delivered', 'Completed', 'Cancelled', 'On Hold'],
    default: 'Pending'
  },
  vehicleNumber: { type: String },
  destination: { type: String },
  transporter: { type: String },
  productPhoto: { type: String }
}, { timestamps: true });

stockTransferOutwardSchema.index({ mucNumber: 1 }, { unique: true });
stockTransferOutwardSchema.index({ mucNumber: 1, orderId: 1 });

module.exports = mongoose.model('StockTransferOutward', stockTransferOutwardSchema); 