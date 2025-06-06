const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
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
  hsnCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HSN',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  generateBagLabel: {
    type: String,
    trim: true
  },
  departments: [
    {
      department: {
        type: String,
        required: true,
        trim: true
      },
      sequence: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ]
}, {
  timestamps: true
});

// Add index for faster queries
productSchema.index({ category: 1 });
productSchema.index({ hsnCode: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 