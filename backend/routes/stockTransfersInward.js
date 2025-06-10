const express = require('express');
const router = express.Router();
const StockTransferInward = require('../models/StockTransferInward');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all inward transfers
router.get('/', async (req, res) => {
  try {
    console.log('Fetching transfers...');
    const transfers = await StockTransferInward.find().sort({ date: -1 });
    console.log('Transfers:', transfers);
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get inward transfer by MUC number
router.get('/muc/:mucNumber', async (req, res) => {
  try {
    const transfer = await StockTransferInward.findOne({ mucNumber: req.params.mucNumber });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (err) {
    console.error('Error fetching transfer by MUC:', err);
    res.status(500).json({ message: 'Error fetching transfer' });
  }
});

// Create new inward transfer
router.post('/', upload.single('productPhoto'), async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    // Validate required fields
    const requiredFields = [
      'mucNumber',
      'inwardNumber',
      'date',
      'fromLocation',
      'toLocation',
      'productName',
      'unit',
      'grade',
      'length',
      'width',
      'thickness',
      'totalMm',
      'quantity'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate numeric fields
    const numericFields = ['length', 'width', 'thickness', 'totalMm', 'quantity'];
    const invalidNumericFields = numericFields.filter(field => 
      isNaN(parseFloat(req.body[field])) || parseFloat(req.body[field]) <= 0
    );
    
    if (invalidNumericFields.length > 0) {
      return res.status(400).json({ 
        message: `Invalid numeric values for fields: ${invalidNumericFields.join(', ')}` 
      });
    }

    const transfer = new StockTransferInward({
      mucNumber: req.body.mucNumber,
      inwardNumber: req.body.inwardNumber,
      date: new Date(req.body.date),
      fromLocation: req.body.fromLocation,
      toLocation: req.body.toLocation,
      productName: req.body.productName,
      unit: req.body.unit,
      grade: req.body.grade,
      length: parseFloat(req.body.length),
      width: parseFloat(req.body.width),
      thickness: parseFloat(req.body.thickness),
      totalMm: parseFloat(req.body.totalMm),
      quantity: parseFloat(req.body.quantity),
      bundleNumber: req.body.bundleNumber,
      remarks: req.body.remarks || '',
      vehicleNumber: req.body.vehicleNumber || '',
      destination: req.body.destination || '',
      transporter: req.body.transporter || '',
      productPhoto: req.file ? req.file.filename : undefined
    });

    const newTransfer = await transfer.save();
    res.status(201).json(newTransfer);
  } catch (err) {
    console.error('Error creating transfer:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors // Include validation errors if any
    });
  }
});

// Update inward transfer
router.patch('/:id', async (req, res) => {
  try {
    const transfer = await StockTransferInward.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    Object.keys(req.body).forEach(key => {
      transfer[key] = req.body[key];
    });

    const updatedTransfer = await transfer.save();
    res.json(updatedTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete inward transfer
router.delete('/:id', async (req, res) => {
  try {
    const transfer = await StockTransferInward.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    await transfer.deleteOne();
    res.json({ message: 'Transfer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 