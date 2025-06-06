const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterialController');

// Get all raw materials
router.get('/', rawMaterialController.getRawMaterials);

// Get raw material by ID
router.get('/:id', rawMaterialController.getRawMaterialById);

// Add new raw material
router.post('/add', rawMaterialController.addRawMaterial);

// Update raw material
router.post('/update/:id', rawMaterialController.updateRawMaterial);

// Delete raw material
router.delete('/delete/:id', rawMaterialController.deleteRawMaterial);

module.exports = router; 