const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  gradeName: {
    type: String,
    required: true,
    trim: true
  },
  gradeValue: {
    type: Number,
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

// Add index for faster queries and uniqueness
gradeSchema.index({ gradeName: 1 }, { unique: true });
gradeSchema.index({ gradeValue: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade; 