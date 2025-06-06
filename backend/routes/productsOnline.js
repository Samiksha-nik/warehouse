const express = require('express');
const router = express.Router();
const ProductOnline = require('../models/ProductOnline');

// Get all products online
router.get('/', async (req, res) => {
  try {
    const products = await ProductOnline.find()
      .populate('category', 'categoryName')
      .populate('grade', 'gradeName')
      .populate('hsnCode', 'hsnCode');
    res.json(products);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get product online by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductOnline.findById(req.params.id)
      .populate('category', 'categoryName')
      .populate('grade', 'gradeName')
      .populate('hsnCode', 'hsnCode');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a new product online
router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const {
      skuCode,
      productId,
      category,
      productName,
      grade,
      thickness,
      length,
      width,
      weight,
      hsnCode,
      mrp
    } = req.body;

    // Validate required fields
    const requiredFields = ['skuCode', 'productId', 'category', 'productName', 'grade', 'thickness', 'length', 'width', 'weight', 'hsnCode', 'mrp'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Check if SKU Code already exists
    const existingSku = await ProductOnline.findOne({ skuCode });
    if (existingSku) {
      return res.status(400).json({ message: 'Product with this SKU Code already exists' });
    }

    // Check if Product ID already exists
    const existingProductId = await ProductOnline.findOne({ productId });
    if (existingProductId) {
      return res.status(400).json({ message: 'Product with this Product ID already exists' });
    }

    const newProductOnline = new ProductOnline({
      skuCode,
      productId,
      category,
      productName,
      grade,
      thickness,
      length,
      width,
      weight,
      hsnCode,
      mrp: parseFloat(mrp)
    });

    console.log('Attempting to save product:', newProductOnline);
    const savedProduct = await newProductOnline.save();
    console.log('Product saved successfully:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors || err
    });
  }
});

// Update a product online
router.put('/:id', async (req, res) => {
  try {
    const {
      skuCode,
      productId,
      category,
      productName,
      grade,
      thickness,
      length,
      width,
      weight,
      hsnCode,
      mrp
    } = req.body;

    // Check if SKU Code already exists for other products
    const existingSku = await ProductOnline.findOne({ 
      skuCode, 
      _id: { $ne: req.params.id } 
    });
    if (existingSku) {
      return res.status(400).json({ message: 'Product with this SKU Code already exists' });
    }

    // Check if Product ID already exists for other products
    const existingProductId = await ProductOnline.findOne({ 
      productId, 
      _id: { $ne: req.params.id } 
    });
    if (existingProductId) {
      return res.status(400).json({ message: 'Product with this Product ID already exists' });
    }

    const updatedProduct = await ProductOnline.findByIdAndUpdate(
      req.params.id,
      {
        skuCode,
        productId,
        category,
        productName,
        grade,
        thickness,
        length,
        width,
        weight,
        hsnCode,
        mrp
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product online
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await ProductOnline.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 