const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  subCategoryName: {
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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
subCategorySchema.index({ subCategoryName: 1, category: 1 }, { unique: true }); // Compound index for unique name within a category

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory; 