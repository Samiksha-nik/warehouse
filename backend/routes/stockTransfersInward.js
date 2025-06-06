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

// Create new inward transfer
router.post('/', upload.single('productPhoto'), async (req, res) => {
  const transfer = new StockTransferInward({
    mucNumber: req.body.mucNumber,
    date: req.body.date,
    fromLocation: req.body.fromLocation,
    toLocation: req.body.toLocation,
    productName: req.body.productName,
    unit: req.body.unit,
    grade: req.body.grade,
    length: req.body.length,
    width: req.body.width,
    thickness: req.body.thickness,
    totalMm: req.body.totalMm,
    quantity: req.body.quantity,
    bundleNumber: req.body.bundleNumber,
    remarks: req.body.remarks,
    status: req.body.status,
    vehicleNumber: req.body.vehicleNumber,
    destination: req.body.destination,
    transporter: req.body.transporter,
    productPhoto: req.file ? req.file.filename : undefined
  });

  try {
    const newTransfer = await transfer.save();
    res.status(201).json(newTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
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