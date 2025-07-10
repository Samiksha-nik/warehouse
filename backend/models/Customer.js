const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Customer Details
  customerCode: { 
    type: String, 
    required: [true, 'Customer code is required'], 
    unique: true, 
    trim: true 
  },
  customerName: { 
    type: String, 
    required: [true, 'Customer name is required'], 
    trim: true 
  },
  contactPerson: { 
    type: String, 
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    trim: true 
  },
  mobileNumber: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: { 
    type: String, 
    trim: true 
  },

  // Billing Address Details
  billingAddress: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Address' 
  },

  // Statutory Details
  gstin: { 
    type: String, 
    trim: true 
  },
  pan: { 
    type: String, 
    trim: true 
  },

  // Bank Details
  bankName: { 
    type: String, 
    trim: true 
  },
  branchName: { 
    type: String, 
    trim: true 
  },
  accountNumber: { 
    type: String, 
    trim: true 
  },
  ifscCode: { 
    type: String, 
    trim: true 
  },

  // Other Details
  remarks: { 
    type: String 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  categoryLinks: [
    {
      category: String,
      product: String,
      unit: String,
      grade: String,
      basicRate: String,
      lastUpdatedDate: String,
      warranty: String,
      materialDescription: String,
      bundleQty: String
    }
  ]
}, {
  timestamps: true
});

// Add index for faster queries
customerSchema.index({ customerCode: 1 });
customerSchema.index({ customerName: 1 });

// Add pre-save middleware to handle errors
customerSchema.pre('save', function(next) {
  try {
    // Trim all string fields
    Object.keys(this._doc).forEach(key => {
      if (typeof this[key] === 'string') {
        this[key] = this[key].trim();
      }
    });
    next();
  } catch (error) {
    next(error);
  }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 