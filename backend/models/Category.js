const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  generateInnerLabel: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add index for faster queries and uniqueness
categorySchema.index({ categoryName: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 