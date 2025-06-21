const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const InventoryAssignment = require('../models/InventoryAssignment');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_USER || 'your_gmail@gmail.com',
    pass: process.env.ALERT_EMAIL_PASS || 'your_gmail_app_password',
  },
});
const ALERT_RECIPIENT = 'nikamsamiksha43@gmail.com';

async function sendLowStockEmailAlert(items) {
  if (!items || items.length === 0) return;
  const html = `
    <h2>Low Stock Alert</h2>
    <p>The following products are below their stock threshold:</p>
    <ul>
      ${items.map(item => `<li><b>${item.productName}</b> (Current: ${item.quantity}, Threshold: ${item.threshold})</li>`).join('')}
    </ul>
  `;
  await transporter.sendMail({
    from: process.env.ALERT_EMAIL_USER || 'your_gmail@gmail.com',
    to: ALERT_RECIPIENT,
    subject: 'Low Stock Alert',
    html,
  });
}

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add a new inventory item
router.post('/', async (req, res) => {
  try {
    console.log('Received inventory data:', req.body);

    // Validate required fields
    const requiredFields = [
      'inventoryType',
      'productName',
      'unit',
      'gradeValue',
      'length',
      'width',
      'thickness',
      'totalMM',
      'quantity',
      'bundleNumber'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const inventory = new Inventory({
      inventoryType: req.body.inventoryType,
      productName: req.body.productName,
      unit: req.body.unit,
      gradeValue: req.body.gradeValue,
      length: parseFloat(req.body.length),
      width: parseFloat(req.body.width),
      thickness: parseFloat(req.body.thickness),
      totalMM: parseFloat(req.body.totalMM),
      quantity: parseFloat(req.body.quantity),
      bundleNumber: req.body.bundleNumber,
      remark: req.body.remark || ''
    });

    console.log('Creating new inventory item:', inventory);

    const newInventory = await inventory.save();
    console.log('Inventory item created successfully:', newInventory);
    res.status(201).json(newInventory);
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.errors // Include validation errors if any
    });
  }
});

// Update an inventory item
router.put('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'length' || key === 'width' || key === 'thickness' || key === 'totalMM' || key === 'quantity') {
        inventory[key] = parseFloat(req.body[key]);
      } else {
        inventory[key] = req.body[key];
      }
    });

    const updatedInventory = await inventory.save();
    res.json(updatedInventory);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all inventory assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await InventoryAssignment.find()
      .sort({ date: -1 }); // Sort by date descending
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching inventory assignments:', err);
    res.status(500).json({ 
      message: 'Error fetching inventory assignments',
      error: err.message 
    });
  }
});

// Create a new inventory assignment
router.post('/assign', async (req, res) => {
  try {
    const newAssignment = new InventoryAssignment(req.body);
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (err) {
    console.error('Error creating inventory assignment:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Error creating inventory assignment',
      error: err.message 
    });
  }
});

// Update an inventory assignment
router.post('/assign/update/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assignment ID format' });
    }

    const assignment = await InventoryAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    Object.assign(assignment, req.body);
    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (err) {
    console.error('Error updating inventory assignment:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Error updating inventory assignment',
      error: err.message 
    });
  }
});

// Delete an inventory assignment
router.delete('/assign/delete/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assignment ID format' });
    }

    const assignment = await InventoryAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await InventoryAssignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory assignment:', err);
    res.status(500).json({ 
      message: 'Error deleting inventory assignment',
      error: err.message 
    });
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: {
        $lt: ['$quantity', '$threshold']
      }
    }).sort({ quantity: 1 });

    // DEMO: Send email if there are low stock items (in real use, call after stock update)
    if (lowStockItems.length > 0) {
      await sendLowStockEmailAlert(lowStockItems);
    }

    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Error fetching low stock items' });
  }
});

module.exports = router; 