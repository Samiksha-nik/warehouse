const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Label = require('../models/Label');
const Dispatch = require('../models/Dispatch');
const StockTransferInward = require('../models/StockTransferInward');

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

// Get a single assignment by labelNumber (MUC Number)
router.get('/label/:labelNumber', async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ labelNumber: req.params.labelNumber });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (err) {
    console.error('Error fetching assignment by label number:', err);
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

// Update an assignment
router.post('/update/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Update the assignment fields
    assignment.date = req.body.date;
    assignment.customerName = req.body.customerName;
    assignment.orderId = req.body.orderId;
    assignment.locationStock = req.body.locationStock;
    assignment.labelNumber = req.body.labelNumber;
    assignment.qrCode = req.body.qrCode;
    assignment.assignTo = req.body.assignTo;
    assignment.labelDetails = req.body.labelDetails;
    assignment.marketplace = req.body.marketplace;

    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors
    });
  }
});

// Search available MUCs for assignment (excluding outwarded/dispatched)
router.get('/assign-inventory-search', async (req, res) => {
  try {
    const { productName, length, width, grade, quantity } = req.query;
    // Build query for StockTransferInward
    let inwardQuery = {};
    if (productName) inwardQuery.productName = productName;
    if (length !== undefined && length !== '' && !isNaN(Number(length))) inwardQuery.length = Number(length);
    if (width !== undefined && width !== '' && !isNaN(Number(width))) inwardQuery.width = Number(width);
    if (grade) inwardQuery.grade = grade;

    // Find all inwards matching the criteria
    let inwards = await StockTransferInward.find(inwardQuery);
    const mucNumbers = inwards.map(i => i.mucNumber).filter(Boolean);

    // Find all assignments and dispatches for these MUCs
    const assignedMUCs = await Assignment.find({ labelNumber: { $in: mucNumbers } }).distinct('labelNumber');
    const dispatchedMUCs = await Dispatch.find({ mucNumber: { $in: mucNumbers } }).distinct('mucNumber');
    const excludedMUCs = new Set([...assignedMUCs, ...dispatchedMUCs]);

    // Filter out excluded MUCs
    let availableInwards = inwards.filter(i => i.mucNumber && !excludedMUCs.has(i.mucNumber));

    // Limit results to requested quantity if provided
    let limitedResults = availableInwards;
    if (quantity && Number(quantity) > 0) {
      limitedResults = availableInwards.slice(0, Number(quantity));
    }

    // Return the available inwards with relevant info
    res.json({
      results: limitedResults.map(i => ({
        mucNumber: i.mucNumber,
        productName: i.productName,
        grade: i.grade,
        length: i.length,
        width: i.width,
        unit: i.unit,
        bundleNumber: i.bundleNumber,
        quantity: i.quantity,
        thickness: i.thickness,
        totalMm: i.totalMm
      })),
      totalAvailable: availableInwards.length
    });
  } catch (err) {
    console.error('Error in assign-inventory-search:', err);
    res.status(500).json({ error: 'Error searching available inventory.' });
  }
});

module.exports = router; 