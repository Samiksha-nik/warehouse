const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Get all sub-categories
router.get('/', subCategoryController.getSubCategories);

// Get sub-category by ID
router.get('/:id', subCategoryController.getSubCategoryById);

// Get sub-categories by Category ID
router.get('/category/:categoryId', subCategoryController.getSubCategoriesByCategory);

// Add new sub-category
router.post('/add', subCategoryController.addSubCategory);

// Update sub-category
router.post('/update/:id', subCategoryController.updateSubCategory);

// Delete sub-category
router.delete('/delete/:id', subCategoryController.deleteSubCategory);

module.exports = router; 