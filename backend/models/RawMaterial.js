const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemCode: {
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
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: false
  },
  description: {
    type: String,
    trim: true
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: false
  },
  thickness: {
    type: String,
    trim: true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  hsnCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HSN',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
rawMaterialSchema.index({ itemName: 1 });
rawMaterialSchema.index({ category: 1 });
rawMaterialSchema.index({ subCategory: 1 });
rawMaterialSchema.index({ unit: 1 });
rawMaterialSchema.index({ hsnCode: 1 });

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

module.exports = RawMaterial; 