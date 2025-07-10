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
  updateDate: {
    type: Date
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
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
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
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      // Find the last order for this year and month
      const lastOrder = await this.constructor.findOne({
        orderNumber: { $regex: `^ORDN/${year}/${month}` }
      }, {}, { sort: { createdAt: -1 } });
      let nextNumber = 1;
      if (lastOrder && lastOrder.orderNumber) {
        const match = lastOrder.orderNumber.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      this.orderNumber = `ORDN/${year}/${month} ${nextNumber.toString().padStart(2, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Remove compound index and pre-save hook related to orderNumber

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 