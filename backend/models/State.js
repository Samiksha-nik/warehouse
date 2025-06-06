const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateName: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  stateCode: { type: String, required: true, unique: true, trim: true, minlength: 2 },
  country: { type: Schema.Types.ObjectId, ref: 'Country', required: true }, // Reference to Country model
  remarks: { type: String },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: true,
});

const State = mongoose.model('State', stateSchema);

module.exports = State; 