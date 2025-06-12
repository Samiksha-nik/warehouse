const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/returns');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all returns (with optional type filter)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const returns = await Return.find(query).sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new return request
router.post('/', upload.single('productPhoto'), async (req, res) => {
  try {
    console.log('Received return request:', req.body);
    console.log('Received file:', req.file);

    const returnRequest = new Return({
      type: req.body.type,
      onlineOrderId: req.body.onlineOrderId,
      labelNumber: req.body.labelNumber,
      returnDate: req.body.returnDate,
      product: req.body.product,
      customerName: req.body.customerName,
      address: req.body.address,
      remarks: req.body.remarks,
      qcImage: req.file ? `/uploads/returns/${req.file.filename}` : '',
      status: 'pending'
    });

    const savedReturn = await returnRequest.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a return request
router.patch('/:id', upload.single('productPhoto'), async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    // Update fields from req.body
    returnRequest.type = req.body.type || returnRequest.type;
    returnRequest.onlineOrderId = req.body.onlineOrderId || returnRequest.onlineOrderId;
    returnRequest.labelNumber = req.body.labelNumber || returnRequest.labelNumber;
    returnRequest.returnDate = req.body.returnDate || returnRequest.returnDate;
    returnRequest.product = req.body.product || returnRequest.product;
    returnRequest.customerName = req.body.customerName || returnRequest.customerName;
    returnRequest.address = req.body.address || returnRequest.address;
    returnRequest.remarks = req.body.remarks || returnRequest.remarks;

    // Update qcImage if a new file is uploaded
    if (req.file) {
      returnRequest.qcImage = `/uploads/returns/${req.file.filename}`;
    }

    const updatedReturn = await returnRequest.save();
    res.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return request:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a return request
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Return.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    res.json({ message: 'Return request deleted successfully' });
  } catch (error) {
    console.error('Error deleting return request:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update return status
router.patch('/:id/status', async (req, res) => {
  try {
    const updated = await Return.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Return request not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 