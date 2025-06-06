const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const countrySchema = new Schema({
  countryName: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  countryCode: { type: String, required: true, unique: true, trim: true, minlength: 2 },
  remarks: { type: String },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true,
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country; 