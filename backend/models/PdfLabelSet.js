const mongoose = require('mongoose');

const PdfLabelRowSchema = new mongoose.Schema({
  "Product Name": String,
  "Label Number": String,
  "Length": String,
  "Width": String,
  "Grade": String,
  "Number of PCS": String,
  "Total MM": String,
  "Weight": String,
  "Remark": String
}, { _id: false });

const PdfLabelSetSchema = new mongoose.Schema({
  rows: [PdfLabelRowSchema],
  outwardNo: { type: String },
  date: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PdfLabelSet', PdfLabelSetSchema); 