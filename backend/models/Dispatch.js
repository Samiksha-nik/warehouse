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
  invoiceUrl: {
    type: String
  },
  qrCode: {
    type: String
  },
  products: [
    {
      product: { type: String, required: true }, // or ObjectId if referencing Product
      quantity: { type: Number, required: true }
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