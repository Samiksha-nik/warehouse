const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
  dispatchNo: {
    type: String,
    required: true,
    unique: true
  },
  dispatchDate: {
    type: Date,
    required: true
  },
  customer: {
    type: String, // or mongoose.Schema.Types.ObjectId if referencing Customer
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  invoiceUrl: {
    type: String
  },
  qrCode: {
    type: String // This is where the MUC number string is stored from frontend
  },
  productPhotoUrl: {
    type: String // New field for the uploaded product photo URL
  },
  mucNumber: { type: String, required: true },
  productName: { type: String, required: true },
  unit: { type: String, required: true },
  grade: { type: String, required: true },
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  thickness: { type: Number, required: false },
  totalMm: { type: Number, required: false },
  quantity: { type: Number, required: true },
  bundleNumber: { type: String },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  address: { type: String, required: true },
  marketplace: { type: String, enum: ['Amazon', 'Flipkart'] },
  products: [
    {
      product: { type: String },
      quantity: { type: Number }
    }
  ],
  shippingAddress: {
    type: String
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'priority']
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
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

dispatchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Dispatch', dispatchSchema); 