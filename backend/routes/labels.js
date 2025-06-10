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

// Get all labels or filter by mucNumber
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.mucNumber) {
      query.mucNumber = req.query.mucNumber;
    }
    
    // Add date range filtering
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
      
      console.log('Date range query:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        query: query.createdAt
      });
    }
    
    const labels = await Label.find(query).sort({ createdAt: -1 });
    console.log('Found labels:', labels.length);
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
      'mucNumber',
      'inventoryType',
      'productName',
      'unit',
      'gradeValue',
      'length',
      'width',
      'thickness',
      'totalMM',
      'quantity'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const label = new Label({
      mucNumber: req.body.mucNumber,
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

// Get a specific label by ID
router.get('/:id', async (req, res) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    res.json(label);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if a MUC number already exists
router.get('/check-muc/:mucNumber', async (req, res) => {
  try {
    const label = await Label.findOne({ mucNumber: req.params.mucNumber });
    res.json({ exists: !!label });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 