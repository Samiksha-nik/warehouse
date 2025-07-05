const mongoose = require('mongoose');

const stockTransferInwardSchema = new mongoose.Schema({
  mucNumber: { type: String },
  inwardNumber: { 
    type: String,
    required: true,
    unique: true
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
  productPhoto: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StockTransferInward', stockTransferInwardSchema, 'stocktransferinward'); 