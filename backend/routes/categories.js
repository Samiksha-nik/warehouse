const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', categoryController.getCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Add new category
router.post('/add', categoryController.addCategory);

// Update category
router.post('/update/:id', categoryController.updateCategory);

// Delete category
router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router; 