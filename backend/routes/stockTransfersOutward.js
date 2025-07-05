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
      .select('mucNumber date fromLocation toLocation productName unit grade length width thickness totalMm quantity bundleNumber vehicleNumber destination transporter productPhoto invoice address customerName')
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
      'mucNumber productName unit grade length width thickness totalMm quantity bundleNumber fromLocation toLocation address customerName'
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
router.post('/', upload.fields([
  { name: 'productPhoto', maxCount: 1 },
  { name: 'invoice', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received transfer request:', req.body);

    // Remove required fields validation
    // const requiredFields = [ ... ];
    // const missingFields = requiredFields.filter(field => !req.body[field]);
    // if (missingFields.length > 0) {
    //   return res.status(400).json({ 
    //     message: `Missing required fields: ${missingFields.join(', ')}` 
    //   });
    // }

    // Validate numeric fields only if present
    const numericFields = ['length', 'width', 'quantity'];
    const invalidNumericFields = numericFields.filter(field =>
      req.body[field] !== undefined && req.body[field] !== '' && (isNaN(parseFloat(req.body[field])) || parseFloat(req.body[field]) <= 0)
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
      date: req.body.date ? new Date(req.body.date) : undefined,
      fromLocation: req.body.fromLocation,
      toLocation: req.body.toLocation,
      productName: req.body.productName,
      unit: req.body.unit,
      grade: req.body.grade,
      length: req.body.length ? parseFloat(req.body.length) : undefined,
      width: req.body.width ? parseFloat(req.body.width) : undefined,
      thickness: req.body.thickness ? parseFloat(req.body.thickness) : undefined,
      totalMm: req.body.totalMm ? parseFloat(req.body.totalMm) : undefined,
      quantity: req.body.quantity ? parseFloat(req.body.quantity) : undefined,
      bundleNumber: req.body.bundleNumber || '',
      remarks: req.body.remarks || '',
      vehicleNumber: req.body.vehicleNumber || '',
      destination: req.body.destination || '',
      transporter: req.body.transporter || '',
      productPhoto: req.files && req.files.productPhoto ? req.files.productPhoto[0].filename : undefined,
      invoice: req.files && req.files.invoice ? req.files.invoice[0].filename : undefined,
      address: req.body.address || '',
      customerName: req.body.customerName || ''
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
router.patch('/:id', upload.fields([
  { name: 'productPhoto', maxCount: 1 },
  { name: 'invoice', maxCount: 1 }
]), async (req, res) => {
  try {
    const transfer = await StockTransferOutward.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Update fields from req.body
    transfer.mucNumber = req.body.mucNumber || transfer.mucNumber;
    transfer.date = req.body.date ? new Date(req.body.date) : transfer.date;
    transfer.fromLocation = req.body.fromLocation || transfer.fromLocation;
    transfer.toLocation = req.body.toLocation || transfer.toLocation;
    transfer.productName = req.body.productName || transfer.productName;
    transfer.unit = req.body.unit || transfer.unit;
    transfer.grade = req.body.grade || transfer.grade;
    transfer.length = parseFloat(req.body.length) || transfer.length;
    transfer.width = parseFloat(req.body.width) || transfer.width;
    transfer.thickness = parseFloat(req.body.thickness) || transfer.thickness;
    transfer.totalMm = parseFloat(req.body.totalMm) || transfer.totalMm;
    transfer.quantity = parseFloat(req.body.quantity) || transfer.quantity;
    transfer.bundleNumber = req.body.bundleNumber || transfer.bundleNumber;
    transfer.remarks = req.body.remarks || transfer.remarks;
    transfer.vehicleNumber = req.body.vehicleNumber || transfer.vehicleNumber;
    transfer.destination = req.body.destination || transfer.destination;
    transfer.transporter = req.body.transporter || transfer.transporter;
    transfer.address = req.body.address || transfer.address;
    transfer.customerName = req.body.customerName || transfer.customerName;

    // Update productPhoto if a new file is uploaded
    if (req.files && req.files.productPhoto) {
      transfer.productPhoto = req.files.productPhoto[0].filename;
    }

    // Update invoice if a new file is uploaded
    if (req.files && req.files.invoice) {
      transfer.invoice = req.files.invoice[0].filename;
    }

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