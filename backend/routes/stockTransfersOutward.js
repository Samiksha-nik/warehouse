const express = require('express');
const router = express.Router();
const StockTransferOutward = require('../models/StockTransferOutward');
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

// Check if MUC number exists
router.get('/check-muc/:mucNumber', async (req, res) => {
  try {
    const transfer = await StockTransferOutward.findOne({ mucNumber: req.params.mucNumber });
    res.json({ exists: !!transfer });
  } catch (err) {
    console.error('Error checking MUC number:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all outward transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await StockTransferOutward.find()
      .select('mucNumber date fromLocation toLocation productName unit grade length width thickness totalMm quantity bundleNumber status vehicleNumber destination transporter productPhoto')
      .sort({ date: -1 });
    console.log('Sending transfers:', transfers); // Debug log
    res.json(transfers);
  } catch (err) {
    console.error('Error fetching transfers:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get outward transfer by MUC number
router.get('/muc/:mucNumber', async (req, res) => {
  try {
    console.log('Fetching transfer for MUC:', req.params.mucNumber);
    const transfer = await StockTransferOutward.findOne(
      { mucNumber: req.params.mucNumber },
      'mucNumber productName unit grade length width thickness totalMm quantity bundleNumber fromLocation toLocation orderId'
    ).lean(); // Use lean() for better performance
    console.log('Found transfer:', transfer);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (err) {
    console.error('Error fetching transfer by MUC:', err);
    res.status(500).json({ message: 'Error fetching transfer' });
  }
});

// Create new outward transfer
router.post('/', upload.single('productPhoto'), async (req, res) => {
  try {
    console.log('Received transfer request:', req.body);

    // Validate required fields
    const requiredFields = [
      'mucNumber',
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
      'quantity',
      'orderId'
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

    // Check for duplicate MUC number
    const existingTransfer = await StockTransferOutward.findOne({ 
      mucNumber: req.body.mucNumber 
    });
    
    if (existingTransfer) {
      return res.status(400).json({ 
        message: 'This MUC number is already used in an outward transfer.' 
      });
    }

    const transfer = new StockTransferOutward({
      mucNumber: req.body.mucNumber,
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
      bundleNumber: req.body.bundleNumber || '',
      orderId: req.body.orderId,
      remarks: req.body.remarks || '',
      status: req.body.status || 'Pending',
      vehicleNumber: req.body.vehicleNumber || '',
      destination: req.body.destination || '',
      transporter: req.body.transporter || '',
      productPhoto: req.file ? req.file.filename : undefined
    });

    const savedTransfer = await transfer.save();
    console.log('Saved transfer:', savedTransfer);
    res.status(201).json(savedTransfer);
  } catch (err) {
    console.error('Error saving transfer:', err);
    if (err.code === 11000) {
      res.status(400).json({ 
        message: 'This MUC number is already used in an outward transfer.' 
      });
    } else {
      res.status(500).json({ 
        message: err.message,
        details: err.errors // Include validation errors if any
      });
    }
  }
});

// Update outward transfer
router.patch('/:id', async (req, res) => {
  try {
    const transfer = await StockTransferOutward.findById(req.params.id);
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

// Delete outward transfer
router.delete('/:id', async (req, res) => {
  try {
    const transfer = await StockTransferOutward.findById(req.params.id);
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