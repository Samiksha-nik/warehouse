const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index for efficient searching
orderSchema.index({ orderNumber: 1, customerName: 1 });

// Add auto-incrementing order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'orderNumber': -1 } });
      const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.slice(3)) : 0;
      this.orderNumber = `ORD${(lastNumber + 1).toString().padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 