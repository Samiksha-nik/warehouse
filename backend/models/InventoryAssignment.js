const mongoose = require('mongoose');

const inventoryAssignmentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerCode: {
    type: String,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  customerGstin: {
    type: String,
    trim: true
  },
  customerPan: {
    type: String,
    trim: true
  },
  customerTan: {
    type: String,
    trim: true
  },
  customerBankName: {
    type: String,
    trim: true
  },
  customerBranchName: {
    type: String,
    trim: true
  },
  customerAccountNumber: {
    type: String,
    trim: true
  },
  customerIfscCode: {
    type: String,
    trim: true
  },
  customerRemarks: {
    type: String,
    trim: true
  },
  labelNumber: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    trim: true
  },
  labelDetails: {
    productName: String,
    unit: String,
    grade: String,
    length: String,
    width: String,
    thickness: String,
    totalMm: String,
    quantity: String,
    bundleNumber: String
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
inventoryAssignmentSchema.index({ orderId: 1 });
inventoryAssignmentSchema.index({ customerName: 1 });
inventoryAssignmentSchema.index({ date: 1 });

const InventoryAssignment = mongoose.model('InventoryAssignment', inventoryAssignmentSchema);

module.exports = InventoryAssignment; 