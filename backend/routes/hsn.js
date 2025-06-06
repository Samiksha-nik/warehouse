const express = require('express');
const router = express.Router();
const hsnController = require('../controllers/hsnController');

// Get all HSN codes
router.get('/', hsnController.getHSNCodes);

// Get HSN code by ID
router.get('/:id', hsnController.getHSNCodeById);

// Add new HSN code
router.post('/add', hsnController.addHSNCode);

// Update HSN code
router.post('/update/:id', hsnController.updateHSNCode);

// Delete HSN code
router.delete('/delete/:id', hsnController.deleteHSNCode);

module.exports = router; 