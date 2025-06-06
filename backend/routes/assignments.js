const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add a new assignment
router.post('/', async (req, res) => {
  try {
    console.log('Received assignment data:', req.body);

    const assignment = new Assignment({
      date: req.body.date,
      customerName: req.body.customerName,
      orderId: req.body.orderId,
      locationStock: req.body.locationStock,
      labelNumber: req.body.labelNumber,
      qrCode: req.body.qrCode,
      assignTo: req.body.assignTo,
      labelDetails: req.body.labelDetails,
      marketplace: req.body.marketplace
    });

    console.log('Creating new assignment:', assignment);

    const newAssignment = await assignment.save();
    console.log('Assignment created successfully:', newAssignment);
    res.status(201).json(newAssignment);
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors
    });
  }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 