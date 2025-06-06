const express = require('express');
const router = express.Router();
const Dispatch = require('../models/Dispatch');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/dispatch');
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

// Get all dispatches
router.get('/', async (req, res) => {
  try {
    const dispatches = await Dispatch.find().sort({ createdAt: -1 });
    res.json(dispatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single dispatch
router.get('/:id', async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.json(dispatch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new dispatch with file upload
router.post('/', upload.fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 }
]), async (req, res) => {
  try {
    const invoiceUrl = req.files.invoice ? `/uploads/dispatch/${req.files.invoice[0].filename}` : '';
    const qrCodeUrl = req.files.qrCode ? `/uploads/dispatch/${req.files.qrCode[0].filename}` : '';

    const dispatch = new Dispatch({
      dispatchNo: req.body.dispatchNo,
      dispatchDate: req.body.dispatchDate,
      customer: req.body.customer,
      invoiceUrl,
      qrCode: qrCodeUrl,
    });

    await dispatch.save();
    res.status(201).json(dispatch);
  } catch (err) {
    console.error('Error creating dispatch:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a dispatch
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Dispatch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.json({ message: 'Dispatch deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Update a dispatch (with file upload support)
router.patch('/:id', upload.fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 }
]), async (req, res) => {
  try {
    const update = {
      dispatchNo: req.body.dispatchNo,
      dispatchDate: req.body.dispatchDate,
      customer: req.body.customer,
    };
    if (req.files && req.files.invoice) {
      update.invoiceUrl = `/uploads/dispatch/${req.files.invoice[0].filename}`;
    }
    if (req.files && req.files.qrCode) {
      update.qrCode = `/uploads/dispatch/${req.files.qrCode[0].filename}`;
    }
    const updated = await Dispatch.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 