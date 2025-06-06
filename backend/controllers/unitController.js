const Unit = require('../models/Unit');

// Get all units
const getUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ unitName: 1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unit by ID
const getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new unit
const addUnit = async (req, res) => {
  try {
    const { unitName, govtUnitCode, status } = req.body;

    // Build the query for duplicate check
    const queryConditions = [
      { unitName: unitName.trim() } // Always check for duplicate unitName
    ];

    // Only add govtUnitCode check if it's provided and not empty
    if (govtUnitCode && govtUnitCode.trim()) {
      queryConditions.push({ govtUnitCode: govtUnitCode.trim() });
    }

    const existingUnit = await Unit.findOne({ $or: queryConditions });

    if (existingUnit) {
      // Check which field caused the duplicate error for a more specific message
      if (existingUnit.unitName === unitName.trim()) {
        return res.status(400).json({ message: 'Unit with this name already exists' });
      } else if (existingUnit.govtUnitCode === govtUnitCode.trim()) {
        return res.status(400).json({ message: 'Unit with this government unit code already exists' });
      } else {
        // Fallback for unexpected scenarios
        return res.status(400).json({ message: 'Duplicate unit entry found' });
      }
    }

    const unit = new Unit({
      unitName: unitName.trim(),
      govtUnitCode: govtUnitCode ? govtUnitCode.trim() : null, // Save as null if not provided
      status: status || 'active'
    });

    const savedUnit = await unit.save();
    res.status(201).json(savedUnit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update unit
const updateUnit = async (req, res) => {
  try {
    const { unitName, govtUnitCode, status } = req.body;

    // Build the query for duplicate check, excluding the current document
    const queryConditions = [
      { unitName: unitName.trim() } // Always check for duplicate unitName
    ];

    // Only add govtUnitCode check if it's provided and not empty
    if (govtUnitCode && govtUnitCode.trim()) {
      queryConditions.push({ govtUnitCode: govtUnitCode.trim() });
    }

    const existingUnit = await Unit.findOne({
      _id: { $ne: req.params.id },
      $or: queryConditions
    });

    if (existingUnit) {
      // Check which field caused the duplicate error for a more specific message
      if (existingUnit.unitName === unitName.trim()) {
        return res.status(400).json({ message: 'Another unit with this name already exists' });
      } else if (existingUnit.govtUnitCode === govtUnitCode.trim()) {
        return res.status(400).json({ message: 'Another unit with this government unit code already exists' });
      } else {
        // Fallback for unexpected scenarios
        return res.status(400).json({ message: 'Another duplicate unit entry found' });
      }
    }

    const updatedUnit = await Unit.findByIdAndUpdate(
      req.params.id,
      {
        unitName,
        govtUnitCode,
        status
      },
      { new: true }
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json(updatedUnit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete unit
const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json({ message: 'Unit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUnits,
  getUnitById,
  addUnit,
  updateUnit,
  deleteUnit
}; 