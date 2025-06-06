const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category'); // Assuming Category model exists

// Get all sub-categories, populated with category details
const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate('category').sort({ subCategoryName: 1 });
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sub-category by ID, populated with category details
const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate('category');
    if (!subCategory) {
      return res.status(404).json({ message: 'SubCategory not found' });
    }
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sub-categories by Category ID
const getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ category: req.params.categoryId }).populate('category').sort({ subCategoryName: 1 });
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Add new sub-category
const addSubCategory = async (req, res) => {
  try {
    const { subCategoryName, category, status, remarks } = req.body;

    // Check if sub-category with same name already exists within the same category
    const existingSubCategory = await SubCategory.findOne({
      subCategoryName: subCategoryName.trim(),
      category: category
    });

    if (existingSubCategory) {
      return res.status(400).json({ message: 'SubCategory with this name already exists for this category' });
    }

     // Check if the parent category exists
     const parentCategory = await Category.findById(category);
     if (!parentCategory) {
       return res.status(404).json({ message: 'Parent category not found' });
     }

    const newSubCategory = new SubCategory({
      subCategoryName: subCategoryName.trim(),
      category,
      status: status || 'active',
      remarks: remarks?.trim() || ''
    });

    const savedSubCategory = await newSubCategory.save();
    // Populate the category field in the response
    await savedSubCategory.populate('category');

    res.status(201).json(savedSubCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update sub-category
const updateSubCategory = async (req, res) => {
  try {
    const { subCategoryName, category, status, remarks } = req.body;

    // Check if another sub-category with the same name exists within the same category (excluding the current one)
    const existingSubCategory = await SubCategory.findOne({
      _id: { $ne: req.params.id },
      subCategoryName: subCategoryName.trim(),
      category: category
    });

    if (existingSubCategory) {
      return res.status(400).json({ message: 'Another subCategory with this name already exists for this category' });
    }

     // Check if the parent category exists if category is being updated
     if (category) {
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
          return res.status(404).json({ message: 'Parent category not found' });
        }
     }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        subCategoryName: subCategoryName.trim(),
        category,
        status,
        remarks: remarks?.trim() || ''
      },
      { new: true }
    ).populate('category'); // Populate category in the response

    if (!updatedSubCategory) {
      return res.status(404).json({ message: 'SubCategory not found' });
    }

    res.json(updatedSubCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete sub-category
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ message: 'SubCategory not found' });
    }
    res.json({ message: 'SubCategory deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory
}; 