const Grade = require('../models/Grade');

// Get all grades
const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ gradeName: 1 });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get grade by ID
const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new grade
const addGrade = async (req, res) => {
  try {
    const { gradeName, gradeValue, status, remarks } = req.body;

    // Check if grade with same name or value already exists
    const existingGrade = await Grade.findOne({
      $or: [
        { gradeName: gradeName.trim() },
        { gradeValue: gradeValue }
      ]
    });

    if (existingGrade) {
      // Check which field caused the duplicate error for a more specific message
      if (existingGrade.gradeName === gradeName.trim()) {
          return res.status(400).json({ message: 'Grade with this name already exists' });
      } else if (existingGrade.gradeValue === gradeValue) {
          return res.status(400).json({ message: 'Grade with this value already exists' });
      } else {
         // Fallback for unexpected scenarios
         return res.status(400).json({ message: 'Duplicate grade entry found' });
      }
    }

    const grade = new Grade({
      gradeName: gradeName.trim(),
      gradeValue,
      status: status || 'active',
      remarks: remarks?.trim() || ''
    });

    const savedGrade = await grade.save();
    res.status(201).json(savedGrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update grade
const updateGrade = async (req, res) => {
  try {
    const { gradeName, gradeValue, status, remarks } = req.body;

    // Check if another grade with same name or value exists
    const existingGrade = await Grade.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { gradeName: gradeName.trim() },
        { gradeValue: gradeValue }
      ]
    });

    if (existingGrade) {
      // Check which field caused the duplicate error for a more specific message
      if (existingGrade.gradeName === gradeName.trim()) {
          return res.status(400).json({ message: 'Another grade with this name already exists' });
      } else if (existingGrade.gradeValue === gradeValue) {
          return res.status(400).json({ message: 'Another grade with this value already exists' });
      } else {
         // Fallback for unexpected scenarios
         return res.status(400).json({ message: 'Another duplicate grade entry found' });
      }
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      {
        gradeName: gradeName.trim(),
        gradeValue,
        status,
        remarks: remarks?.trim() || ''
      },
      { new: true }
    );

    if (!updatedGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(updatedGrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete grade
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getGrades,
  getGradeById,
  addGrade,
  updateGrade,
  deleteGrade
}; 