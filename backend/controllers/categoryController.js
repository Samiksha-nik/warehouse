const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ categoryName: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { categoryName, remarks, generateInnerLabel, status } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ categoryName: categoryName.trim() });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const newCategory = new Category({
      categoryName: categoryName.trim(),
      remarks: remarks?.trim() || '',
      generateInnerLabel: generateInnerLabel || 'no',
      status: status || 'active'
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { categoryName, remarks, generateInnerLabel, status } = req.body;

    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({
      _id: { $ne: req.params.id },
      categoryName: categoryName.trim()
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        categoryName: categoryName.trim(),
        remarks: remarks?.trim() || '',
        generateInnerLabel,
        status
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory
}; 