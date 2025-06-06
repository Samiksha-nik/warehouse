const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// Get all units
router.get('/', unitController.getUnits);

// Get unit by ID
router.get('/:id', unitController.getUnitById);

// Add new unit
router.post('/add', unitController.addUnit);

// Update unit
router.post('/update/:id', unitController.updateUnit);

// Delete unit
router.delete('/delete/:id', unitController.deleteUnit);

module.exports = router; 