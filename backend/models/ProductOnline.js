const mongoose = require('mongoose');

const productOnlineSchema = new mongoose.Schema({
  skuCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: true
  },
  thickness: {
    type: String,
    required: true,
    trim: true
  },
  length: {
    type: String,
    required: true,
    trim: true
  },
  width: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: String,
    required: true,
    trim: true
  },
  hsnCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HSN',
    required: true
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  generateBagLabel: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
productOnlineSchema.index({ category: 1 });
productOnlineSchema.index({ grade: 1 });
productOnlineSchema.index({ hsnCode: 1 });

const ProductOnline = mongoose.model('ProductOnline', productOnlineSchema);

module.exports = ProductOnline; 