const router = require('express').Router();
let Customer = require('../models/Customer');
const mongoose = require('mongoose');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('billingAddress')
      .sort({ customerName: 1 }); // Sort by customer name
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ 
      message: 'Error fetching customers',
      error: err.message 
    });
  }
});

// Get a specific customer by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }

    const customer = await Customer.findById(req.params.id)
      .populate('billingAddress');
      
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ 
      message: 'Error fetching customer',
      error: err.message 
    });
  }
});

// Add a new customer
router.post('/add', async (req, res) => {
  try {
    // Check for duplicate customer code
    const existingCustomer = await Customer.findOne({ 
      customerCode: req.body.customerCode 
    });
    
    if (existingCustomer) {
      return res.status(400).json({ 
        message: 'Customer code already exists' 
      });
    }

    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    
    // Populate the saved customer with related data
    const populatedCustomer = await Customer.findById(savedCustomer._id)
      .populate('billingAddress');
      
    res.status(201).json(populatedCustomer);
  } catch (err) {
    console.error('Error adding customer:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Error adding customer',
      error: err.message 
    });
  }
});

// Update a customer
router.post('/update/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }

    // Check if customer exists
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check for duplicate customer code if code is being changed
    if (req.body.customerCode && req.body.customerCode !== customer.customerCode) {
      const existingCustomer = await Customer.findOne({ 
        customerCode: req.body.customerCode 
      });
      if (existingCustomer) {
        return res.status(400).json({ 
          message: 'Customer code already exists' 
        });
      }
    }

    // Update customer
    Object.assign(customer, req.body);
    const updatedCustomer = await customer.save();
    
    // Populate the updated customer with related data
    const populatedCustomer = await Customer.findById(updatedCustomer._id)
      .populate('billingAddress');
      
    res.json(populatedCustomer);
  } catch (err) {
    console.error('Error updating customer:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Error updating customer',
      error: err.message 
    });
  }
});

// Delete a customer
router.delete('/delete/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ 
      message: 'Error deleting customer',
      error: err.message 
    });
  }
});

module.exports = router; 