const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citySchema = new Schema({
  cityName: { type: String, required: true, trim: true, minlength: 2 },
  cityCode: { type: String, required: true, unique: true, trim: true, minlength: 2 },
  state: { type: Schema.Types.ObjectId, ref: 'State', required: true }, // Reference to State model
  country: { type: Schema.Types.ObjectId, ref: 'Country', required: true }, // Reference to Country model
  remarks: { type: String },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: true,
});

// Add unique compound index for cityName and state to prevent duplicate cities within the same state
citySchema.index({ cityName: 1, state: 1 }, { unique: true });

const City = mongoose.model('City', citySchema);

module.exports = City; 