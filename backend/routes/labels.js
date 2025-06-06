const express = require('express');
const router = express.Router();
const Label = require('../models/Label');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRReader = require('qrcode-reader');
const Jimp = require('jimp');
// You may need a QR code processing library, e.g., 'qrcode-reader' or similar

// Set up multer for file uploads
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Get all labels
router.get('/', async (req, res) => {
  try {
    const labels = await Label.find().sort({ createdAt: -1 });
    res.json(labels);
  } catch (err) {
    console.error('Error fetching labels:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add a new label
router.post('/', async (req, res) => {
  try {
    console.log('Received label data:', req.body);

    // Validate required fields
    const requiredFields = [
      'inventoryType',
      'productName',
      'unit',
      'gradeValue',
      'length',
      'width',
      'thickness',
      'totalMM',
      'quantity',
      'bundleNumber'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Do NOT set labelNumber here; let the model's pre-save hook handle it
    const label = new Label({
      inventoryType: req.body.inventoryType,
      productName: req.body.productName,
      unit: req.body.unit,
      gradeValue: req.body.gradeValue,
      length: parseFloat(req.body.length),
      width: parseFloat(req.body.width),
      thickness: parseFloat(req.body.thickness),
      totalMM: parseFloat(req.body.totalMM),
      quantity: parseFloat(req.body.quantity),
      bundleNumber: req.body.bundleNumber,
      remark: req.body.remark || ''
    });

    console.log('Creating new label:', label);

    const newLabel = await label.save();
    console.log('Label created successfully:', newLabel);
    res.status(201).json(newLabel);
  } catch (err) {
    console.error('Error creating label:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors // Include validation errors if any
    });
  }
});

// Delete a label
router.delete('/:id', async (req, res) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    await Label.findByIdAndDelete(req.params.id);
    res.json({ message: 'Label deleted' });
  } catch (err) {
    console.error('Error deleting label:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /scan - process QR code image and return label details
router.post('/scan', upload.single('qrCode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Read the image using Jimp
    const image = await Jimp.read(req.file.path);
    const qr = new QRReader();
    const value = await new Promise((resolve, reject) => {
      qr.callback = (err, v) => {
        if (err) return reject(err);
        resolve(v);
      };
      qr.decode(image.bitmap);
    });
    // The QR code value should be the label number
    let labelNumberFromQR = value && value.result ? value.result : '';
    console.log('Decoded QR value:', labelNumberFromQR);
    labelNumberFromQR = labelNumberFromQR.trim();
    // Try to pad with zeros if it's a number and less than 4 digits
    if (/^\d{1,4}$/.test(labelNumberFromQR)) {
      labelNumberFromQR = labelNumberFromQR.padStart(4, '0');
    }
    if (!labelNumberFromQR) {
      return res.status(400).json({ message: 'Could not decode QR code or label number not found.' });
    }
    const label = await Label.findOne({ labelNumber: labelNumberFromQR });
    if (!label) {
      return res.status(404).json({ message: 'Label not found for QR code.' });
    }
    res.json({
      qrCode: label.labelNumber,
      labelDetails: label
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    // Clean up uploaded file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

// GET /:labelNumber - fetch label details by label number
router.get('/:labelNumber', async (req, res) => {
  try {
    const label = await Label.findOne({ labelNumber: req.params.labelNumber });
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    res.json(label);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 