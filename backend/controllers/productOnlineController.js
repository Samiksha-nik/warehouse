const ProductOnline = require('../models/ProductOnline');
const Category = require('../models/Category'); // Assuming Category model exists
const Grade = require('../models/Grade'); // Assuming Grade model exists
const HSN = require('../models/HSN'); // Assuming HSN model exists

// Get all online products, populated with category, grade, and hsn details
const getProductOnline = async (req, res) => {
  try {
    const productsOnline = await ProductOnline.find()
      .populate('category')
      .populate('grade')
      .populate('hsnCode')
      .sort({ skuCode: 1 });
    res.json(productsOnline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get online product by ID, populated with category, grade, and hsn details
const getProductOnlineById = async (req, res) => {
  try {
    const productOnline = await ProductOnline.findById(req.params.id)
      .populate('category')
      .populate('grade')
      .populate('hsnCode');
    if (!productOnline) {
      return res.status(404).json({ message: 'Product Online not found' });
    }
    res.json(productOnline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new online product
const addProductOnline = async (req, res) => {
  try {
    const { skuCode, productId, category, productName, grade, thickness, length, width, weight, hsnCode, mrp, status, generateBagLabel } = req.body;

    // Check if product with same skuCode or productId already exists
    const existingProduct = await ProductOnline.findOne({
      $or: [
        { skuCode: skuCode.trim() },
        { productId: productId.trim() }
      ]
    });

    if (existingProduct) {
       if (existingProduct.skuCode === skuCode.trim()) {
          return res.status(400).json({ message: 'Product with this SKU Code already exists' });
       } else if (existingProduct.productId === productId.trim()) {
          return res.status(400).json({ message: 'Product with this Product ID already exists' });
       } else {
          return res.status(400).json({ message: 'Duplicate product online entry found' });
       }
    }

    // Check if category, grade, and HSN exist
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const relatedGrade = await Grade.findById(grade);
     if (!relatedGrade) {
        return res.status(404).json({ message: 'Grade not found' });
     }

    const relatedHSN = await HSN.findById(hsnCode);
    if (!relatedHSN) {
       return res.status(404).json({ message: 'HSN code not found' });
    }

    const newProductOnline = new ProductOnline({
      skuCode: skuCode.trim(),
      productId: productId.trim(),
      category,
      productName: productName.trim(),
      grade,
      thickness: thickness.trim(),
      length: length.trim(),
      width: width.trim(),
      weight: weight.trim(),
      hsnCode,
      mrp,
      status: status || 'active',
      generateBagLabel: generateBagLabel?.trim() || '',
    });

    const savedProductOnline = await newProductOnline.save();
    // Populate the referenced fields in the response
    await savedProductOnline.populate('category');
    await savedProductOnline.populate('grade');
    await savedProductOnline.populate('hsnCode');

    res.status(201).json(savedProductOnline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update online product
const updateProductOnline = async (req, res) => {
  try {
    const { skuCode, productId, category, productName, grade, thickness, length, width, weight, hsnCode, mrp, status, generateBagLabel } = req.body;

    // Check if another product with the same skuCode or productId exists (excluding the current one)
     const existingProduct = await ProductOnline.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { skuCode: skuCode.trim() },
        { productId: productId.trim() }
      ]
    });

    if (existingProduct) {
       if (existingProduct.skuCode === skuCode.trim()) {
          return res.status(400).json({ message: 'Another product with this SKU Code already exists' });
       } else if (existingProduct.productId === productId.trim()) {
          return res.status(400).json({ message: 'Another product with this Product ID already exists' });
       } else {
          return res.status(400).json({ message: 'Another duplicate product online entry found' });
       }
    }

     // Check if category, grade, and HSN exist if they are being updated
    if (category) {
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }
    }

    if (grade) {
        const relatedGrade = await Grade.findById(grade);
        if (!relatedGrade) {
           return res.status(404).json({ message: 'Grade not found' });
        }
    }

    if (hsnCode) {
        const relatedHSN = await HSN.findById(hsnCode);
        if (!relatedHSN) {
           return res.status(404).json({ message: 'HSN code not found' });
        }
    }

    const updatedProductOnline = await ProductOnline.findByIdAndUpdate(
      req.params.id,
      {
        skuCode: skuCode.trim(),
        productId: productId.trim(),
        category,
        productName: productName.trim(),
        grade,
        thickness: thickness.trim(),
        length: length.trim(),
        width: width.trim(),
        weight: weight.trim(),
        hsnCode,
        mrp,
        status,
        generateBagLabel: generateBagLabel?.trim() || '',
      },
      { new: true }
    ).populate('category').populate('grade').populate('hsnCode'); // Populate referenced fields in the response

    if (!updatedProductOnline) {
      return res.status(404).json({ message: 'Product Online not found' });
    }

    res.json(updatedProductOnline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete online product
const deleteProductOnline = async (req, res) => {
  try {
    const productOnline = await ProductOnline.findByIdAndDelete(req.params.id);
    if (!productOnline) {
      return res.status(404).json({ message: 'Product Online not found' });
    }
    res.json({ message: 'Product Online deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProductOnline,
  getProductOnlineById,
  addProductOnline,
  updateProductOnline,
  deleteProductOnline
}; 