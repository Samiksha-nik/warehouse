const RawMaterial = require('../models/RawMaterial');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Grade = require('../models/Grade');
const Unit = require('../models/Unit');
const HSN = require('../models/HSN');

// Get all raw materials with populated references
const getRawMaterials = async (req, res) => {
  try {
    const rawMaterials = await RawMaterial.find()
      .populate('category')
      .populate('subCategory')
      .populate('grade')
      .populate('unit')
      .populate('hsnCode')
      .sort({ itemName: 1 });
    res.json(rawMaterials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get raw material by ID
const getRawMaterialById = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id)
      .populate('category')
      .populate('subCategory')
      .populate('grade')
      .populate('unit')
      .populate('hsnCode');
    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }
    res.json(rawMaterial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new raw material
const addRawMaterial = async (req, res) => {
  try {
    const { itemName, itemCode, category, subCategory, description, grade, thickness, unit, hsnCode, status } = req.body;

    // Check if raw material with same item code already exists
    const existingRawMaterial = await RawMaterial.findOne({ itemCode: itemCode.trim() });
    if (existingRawMaterial) {
      return res.status(400).json({ message: 'Raw material with this item code already exists' });
    }

    // Validate references
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (subCategory) {
      const relatedSubCategory = await SubCategory.findById(subCategory);
      if (!relatedSubCategory) {
        return res.status(404).json({ message: 'Sub category not found' });
      }
    }

    if (grade) {
      const relatedGrade = await Grade.findById(grade);
      if (!relatedGrade) {
        return res.status(404).json({ message: 'Grade not found' });
      }
    }

    const relatedUnit = await Unit.findById(unit);
    if (!relatedUnit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const relatedHSN = await HSN.findById(hsnCode);
    if (!relatedHSN) {
      return res.status(404).json({ message: 'HSN code not found' });
    }

    const newRawMaterial = new RawMaterial({
      itemName: itemName.trim(),
      itemCode: itemCode.trim(),
      category,
      subCategory: subCategory || null,
      description: description?.trim() || '',
      grade: grade || null,
      thickness: thickness?.trim() || '',
      unit,
      hsnCode,
      status: status || 'active'
    });

    const savedRawMaterial = await newRawMaterial.save();
    // Populate all references in the response
    await savedRawMaterial.populate('category');
    await savedRawMaterial.populate('subCategory');
    await savedRawMaterial.populate('grade');
    await savedRawMaterial.populate('unit');
    await savedRawMaterial.populate('hsnCode');

    res.status(201).json(savedRawMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update raw material
const updateRawMaterial = async (req, res) => {
  try {
    const { itemName, itemCode, category, subCategory, description, grade, thickness, unit, hsnCode, status } = req.body;

    // Check if another raw material with the same item code exists (excluding current one)
    const existingRawMaterial = await RawMaterial.findOne({
      _id: { $ne: req.params.id },
      itemCode: itemCode.trim()
    });

    if (existingRawMaterial) {
      return res.status(400).json({ message: 'Another raw material with this item code already exists' });
    }

    // Validate references
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (subCategory) {
      const relatedSubCategory = await SubCategory.findById(subCategory);
      if (!relatedSubCategory) {
        return res.status(404).json({ message: 'Sub category not found' });
      }
    }

    if (grade) {
      const relatedGrade = await Grade.findById(grade);
      if (!relatedGrade) {
        return res.status(404).json({ message: 'Grade not found' });
      }
    }

    const relatedUnit = await Unit.findById(unit);
    if (!relatedUnit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const relatedHSN = await HSN.findById(hsnCode);
    if (!relatedHSN) {
      return res.status(404).json({ message: 'HSN code not found' });
    }

    const updatedRawMaterial = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      {
        itemName: itemName.trim(),
        itemCode: itemCode.trim(),
        category,
        subCategory: subCategory || null,
        description: description?.trim() || '',
        grade: grade || null,
        thickness: thickness?.trim() || '',
        unit,
        hsnCode,
        status
      },
      { new: true }
    ).populate('category')
     .populate('subCategory')
     .populate('grade')
     .populate('unit')
     .populate('hsnCode');

    if (!updatedRawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    res.json(updatedRawMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete raw material
const deleteRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findByIdAndDelete(req.params.id);
    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }
    res.json({ message: 'Raw material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRawMaterials,
  getRawMaterialById,
  addRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
}; 