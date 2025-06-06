const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    }
  },
  gstin: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  panNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  bankDetails: {
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true
    },
    branchName: {
      type: String,
      required: true,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

// Update the updatedAt timestamp before saving
supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier; 