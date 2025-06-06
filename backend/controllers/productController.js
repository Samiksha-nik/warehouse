const Product = require('../models/Product');
const Category = require('../models/Category'); // Assuming Category model exists
const HSN = require('../models/HSN'); // Assuming HSN model exists

// Get all products, populated with category and hsn details
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .populate('hsnCode')
      .sort({ productName: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID, populated with category and hsn details
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('hsnCode');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const { productName, category, hsnCode, status, generateBagLabel, departments } = req.body;

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ productName: productName.trim() });

    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    // Check if category and HSN exist
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    const relatedHSN = await HSN.findById(hsnCode);
    if (!relatedHSN) {
       return res.status(404).json({ message: 'Related HSN code not found' });
    }

    const newProduct = new Product({
      productName: productName.trim(),
      category,
      hsnCode,
      status: status || 'active',
      generateBagLabel: generateBagLabel?.trim() || '',
      departments: departments || [] // Save departments array
    });

    const savedProduct = await newProduct.save();
    // Populate the category and hsnCode fields in the response
    await savedProduct.populate('category');
    await savedProduct.populate('hsnCode');

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { productName, category, hsnCode, status, generateBagLabel, departments } = req.body;

    // Check if another product with the same name exists (excluding the current one)
    const existingProduct = await Product.findOne({
      _id: { $ne: req.params.id },
      productName: productName.trim()
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'Another product with this name already exists' });
    }

     // Check if category and HSN exist if they are being updated
    if (category) {
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
          return res.status(404).json({ message: 'Parent category not found' });
        }
    }

    if (hsnCode) {
        const relatedHSN = await HSN.findById(hsnCode);
        if (!relatedHSN) {
           return res.status(404).json({ message: 'Related HSN code not found' });
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName: productName.trim(),
        category,
        hsnCode,
        status,
        generateBagLabel: generateBagLabel?.trim() || '',
        departments: departments || [] // Update departments array
      },
      { new: true }
    ).populate('category').populate('hsnCode'); // Populate category and hsnCode in the response

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
}; 