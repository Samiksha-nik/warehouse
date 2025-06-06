const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate('address.country', 'countryName')
      .populate('address.state', 'stateName')
      .populate('address.city', 'cityName');
    res.json(suppliers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('address.country', 'countryName')
      .populate('address.state', 'stateName')
      .populate('address.city', 'cityName');
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a new supplier
router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const {
      supplierCode,
      supplierName,
      contactPerson,
      email,
      phone,
      address,
      gstin,
      panNumber,
      bankDetails,
      status
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'supplierCode', 'supplierName', 'contactPerson', 'email', 'phone',
      'address', 'gstin', 'panNumber', 'bankDetails'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Validate address fields
    if (!address.country || !address.state || !address.city) {
      return res.status(400).json({ 
        message: 'Country, State, and City are required' 
      });
    }

    // Check if supplier code already exists
    const existingCode = await Supplier.findOne({ supplierCode });
    if (existingCode) {
      return res.status(400).json({ message: 'Supplier with this code already exists' });
    }

    // Check if GSTIN already exists
    const existingGstin = await Supplier.findOne({ gstin });
    if (existingGstin) {
      return res.status(400).json({ message: 'Supplier with this GSTIN already exists' });
    }

    // Check if PAN number already exists
    const existingPan = await Supplier.findOne({ panNumber });
    if (existingPan) {
      return res.status(400).json({ message: 'Supplier with this PAN number already exists' });
    }

    const newSupplier = new Supplier({
      supplierCode,
      supplierName,
      contactPerson,
      email,
      phone,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode
      },
      gstin,
      panNumber,
      bankDetails,
      status: status || 'active'
    });

    console.log('Attempting to save supplier:', newSupplier);
    const savedSupplier = await newSupplier.save();
    const populatedSupplier = await Supplier.findById(savedSupplier._id)
      .populate('address.country', 'countryName')
      .populate('address.state', 'stateName')
      .populate('address.city', 'cityName');
    console.log('Supplier saved successfully:', populatedSupplier);
    res.status(201).json(populatedSupplier);
  } catch (err) {
    console.error('Error saving supplier:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors || err
    });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    const {
      supplierCode,
      supplierName,
      contactPerson,
      email,
      phone,
      address,
      gstin,
      panNumber,
      bankDetails,
      status
    } = req.body;

    // Validate address fields
    if (!address.country || !address.state || !address.city) {
      return res.status(400).json({ 
        message: 'Country, State, and City are required' 
      });
    }

    // Check if supplier code already exists for other suppliers
    const existingCode = await Supplier.findOne({ 
      supplierCode, 
      _id: { $ne: req.params.id } 
    });
    if (existingCode) {
      return res.status(400).json({ message: 'Supplier with this code already exists' });
    }

    // Check if GSTIN already exists for other suppliers
    const existingGstin = await Supplier.findOne({ 
      gstin, 
      _id: { $ne: req.params.id } 
    });
    if (existingGstin) {
      return res.status(400).json({ message: 'Supplier with this GSTIN already exists' });
    }

    // Check if PAN number already exists for other suppliers
    const existingPan = await Supplier.findOne({ 
      panNumber, 
      _id: { $ne: req.params.id } 
    });
    if (existingPan) {
      return res.status(400).json({ message: 'Supplier with this PAN number already exists' });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        supplierCode,
        supplierName,
        contactPerson,
        email,
        phone,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode
        },
        gstin,
        panNumber,
        bankDetails,
        status,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('address.country', 'countryName')
     .populate('address.state', 'stateName')
     .populate('address.city', 'cityName');

    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a supplier
router.delete('/:id', async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 