const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Add new product
router.post('/add', productController.addProduct);

// Update product
router.post('/update/:id', productController.updateProduct);

// Delete product
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router; 