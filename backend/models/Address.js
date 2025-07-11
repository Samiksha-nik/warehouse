const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  addressLine3: { type: String, trim: true },
  area: { type: String, trim: true },
  kmFromFactory: { type: String, trim: true },
  country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
  state: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  telephone: { type: String, trim: true },
  mobile: { type: String, trim: true },
  fax: { type: String, trim: true },
  email: { type: String, trim: true },
  remarks: { type: String },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
  customerName: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  addressType: { type: String, required: true, enum: ['Billing', 'Delivery'] }
}, {
  timestamps: true
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; 