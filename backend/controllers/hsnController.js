const HSN = require('../models/HSN');

// Get all HSN codes
const getHSNCodes = async (req, res) => {
  try {
    const hsnCodes = await HSN.find().sort({ hsnCode: 1 });
    res.json(hsnCodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get HSN code by ID
const getHSNCodeById = async (req, res) => {
  try {
    const hsnCode = await HSN.findById(req.params.id);
    if (!hsnCode) {
      return res.status(404).json({ message: 'HSN Code not found' });
    }
    res.json(hsnCode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new HSN code
const addHSNCode = async (req, res) => {
  try {
    const { hsnCode, sgst, cgst, igst, description, status } = req.body;

    // Check if HSN code already exists
    const existingHSN = await HSN.findOne({ hsnCode: hsnCode.trim() });

    if (existingHSN) {
      return res.status(400).json({ message: 'HSN Code already exists' });
    }

    const newHSN = new HSN({
      hsnCode: hsnCode.trim(),
      sgst: parseFloat(sgst),
      cgst: parseFloat(cgst),
      igst: parseFloat(igst),
      description: description?.trim() || '',
      status: status || 'active'
    });

    const savedHSN = await newHSN.save();
    res.status(201).json(savedHSN);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update HSN code
const updateHSNCode = async (req, res) => {
  try {
    const { hsnCode, sgst, cgst, igst, description, status } = req.body;

    // Check if another HSN code with the same code exists
    const existingHSN = await HSN.findOne({
      _id: { $ne: req.params.id },
      hsnCode: hsnCode.trim()
    });

    if (existingHSN) {
      return res.status(400).json({ message: 'Another HSN Code with this code already exists' });
    }

    const updatedHSN = await HSN.findByIdAndUpdate(
      req.params.id,
      {
        hsnCode: hsnCode.trim(),
        sgst: parseFloat(sgst),
        cgst: parseFloat(cgst),
        igst: parseFloat(igst),
        description: description?.trim() || '',
        status
      },
      { new: true }
    );

    if (!updatedHSN) {
      return res.status(404).json({ message: 'HSN Code not found' });
    }

    res.json(updatedHSN);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete HSN code
const deleteHSNCode = async (req, res) => {
  try {
    const hsnCode = await HSN.findByIdAndDelete(req.params.id);
    if (!hsnCode) {
      return res.status(404).json({ message: 'HSN Code not found' });
    }
    res.json({ message: 'HSN Code deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getHSNCodes,
  getHSNCodeById,
  addHSNCode,
  updateHSNCode,
  deleteHSNCode
}; 