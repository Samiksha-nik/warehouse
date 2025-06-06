const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
  state: { type: Schema.Types.ObjectId, ref: 'State', required: true },
  city: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  pincode: { type: String, required: true, trim: true },
  telephone: { type: String, trim: true },
  mobile: { type: String, trim: true },
  fax: { type: String, trim: true },
  email: { type: String, trim: true },
  remarks: { type: String },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; 