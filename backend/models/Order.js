const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String
  },
  orderUserId: {
    type: Number,
    required: true
  },
  TCSper: {
    type: Number,
    required: true,
    default: 0.1
  },
  orderDate: {
    type: Date,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  totalQuantity: {
    type: Number
  },
  deliveryDate: {
    type: Date
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['draft', 'complete'],
    default: 'draft'
  },
  updateDate: {
    type: Date
  },
  products: [{
    srNo: { type: Number },
    productName: { type: String, required: true },
    unit: { type: String, required: true },
    gradeValue: { type: String },
    length: { type: Number },
    width: { type: Number },
    thickness: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    bundle: { type: Number },
    bundleLimit: { type: Number },
    weight: { type: Number },
    totalMM: { type: Number },
    id: { type: String },
    remark: { type: String },
    sellingPrice: { type: Number },
    basicRate: { type: Number },
    amount: { type: Number }
  }],
  notes: {
    type: String
  },
  billingAddress: {
    type: Object // Store the full billing address details
  },
  deliveryAddress: {
    type: Object // Store the full delivery address details
  },
  poNo: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generate orderNumber if not provided
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2); // '25' for 2025
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // '07' for July
      // Find the last order for this year and month
      const lastOrder = await this.constructor.findOne({
        orderNumber: { $regex: `^ORDN/${year}/${month}/` }
      }, {}, { sort: { createdAt: -1 } });
      let nextNumber = 1;
      if (lastOrder && lastOrder.orderNumber) {
        const match = lastOrder.orderNumber.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      this.orderNumber = `ORDN/${year}/${month}/${nextNumber.toString().padStart(2, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Remove compound index and pre-save hook related to orderNumber

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 