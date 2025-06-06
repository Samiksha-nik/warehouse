const express = require('express');
const router = express.Router();
const Return = require('../models/Return');

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
router.post('/', async (req, res) => {
  try {
    const returnRequest = new Return(req.body);
    const savedReturn = await returnRequest.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a return request
router.patch('/:id', async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    Object.assign(returnRequest, req.body);
    const updatedReturn = await returnRequest.save();
    res.json(updatedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a return request
router.delete('/:id', async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    await returnRequest.remove();
    res.json({ message: 'Return request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 