const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Add new address
router.post('/add', addressController.addAddress);

// Get all addresses
router.get('/', addressController.getAddresses);

// Get address by ID
router.get('/:id', addressController.getAddressById);

// Update address
router.put('/update/:id', addressController.updateAddress);

// Delete address
router.delete('/delete/:id', addressController.deleteAddress);

module.exports = router; 