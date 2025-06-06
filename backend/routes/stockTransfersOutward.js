const express = require('express');
const router = express.Router();
const StockTransferOutward = require('../models/StockTransferOutward');

// Get all outward transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await StockTransferOutward.find().sort({ date: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new outward transfer
router.post('/', async (req, res) => {
  const transfer = new StockTransferOutward({
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
    status: req.body.status
  });

  try {
    const newTransfer = await transfer.save();
    res.status(201).json(newTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
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