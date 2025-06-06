const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

// Get all grades
router.get('/', gradeController.getGrades);

// Get grade by ID
router.get('/:id', gradeController.getGradeById);

// Add new grade
router.post('/add', gradeController.addGrade);

// Update grade
router.post('/update/:id', gradeController.updateGrade);

// Delete grade
router.delete('/delete/:id', gradeController.deleteGrade);

module.exports = router; 