const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const PdfLabelSet = require('../models/PdfLabelSet');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// PDF upload and extraction endpoint
router.post('/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // Debug: Print the extracted text to the console
    console.log('Extracted PDF text (first 40 lines):');
    text.split('\n').slice(0, 40).forEach((line, idx) => console.log(idx + 1, line));

    // Split text into lines and trim
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Find the start of the table (first line that matches the label/length/width/grade pattern)
    const tableStartIdx = lines.findIndex(line => /\d{5,}\s+\d+\s+\d+4\"\s+\d+\s+[\d.]+\s+[\d.]+/.test(line));
    if (tableStartIdx === -1) {
      return res.status(400).json({ error: 'Could not find table data in PDF.' });
    }

    // Extract table rows by combining pairs of lines
    const extractedRows = [];
    for (let i = tableStartIdx; i < lines.length - 1; i++) {
      const dataLine = lines[i];
      const productLine = lines[i + 1];
      // Match the data line
      const match = dataLine.match(/(\d{5,})\s+(\d+)\s+(\d+)4\"\s+(\d+)\s+([\d.]+)\s+([\d.]+)/);
      if (match && productLine && !/^\d+$/.test(productLine)) {
        extractedRows.push({
          "Product Name": productLine,
          "Label Number": match[1],
          "Length": match[2],
          "Width": match[3],
          "Grade": '4"',
          "Number of PCS": match[4],
          "Total MM": match[5],
          "Weight": match[6],
          "Remark": ''
        });
        i++; // Skip the next line since it's the product name
      }
    }

    res.json({ data: extractedRows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse PDF' });
  } finally {
    fs.unlinkSync(req.file.path); // Clean up uploaded file
  }
});

// Save a set of extracted label rows
router.post('/save', async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No rows to save.' });
    }
    const labelSet = new PdfLabelSet({ rows });
    await labelSet.save();
    res.json({ message: 'Label set saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save label set.' });
  }
});

// Get all saved label sets
router.get('/list', async (req, res) => {
  try {
    const sets = await PdfLabelSet.find().sort({ createdAt: -1 });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch label sets.' });
  }
});

// Delete a saved label set by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PdfLabelSet.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Label set not found.' });
    }
    res.json({ message: 'Label set deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete label set.' });
  }
});

// Fetch a label row by MUC number (Label Number) from the most recent PdfLabelSet
router.get('/by-muc', async (req, res) => {
  try {
    const { mucNumber } = req.query;
    if (!mucNumber) return res.status(400).json({ error: 'mucNumber is required' });
    // Find the most recent label set
    const latestSet = await PdfLabelSet.findOne().sort({ createdAt: -1 });
    if (!latestSet || !latestSet.rows) return res.status(404).json({ error: 'No label sets found' });
    // Find the row with the matching Label Number (case-insensitive, trimmed)
    const row = latestSet.rows.find(r => r["Label Number"] && r["Label Number"].trim().toLowerCase() === mucNumber.trim().toLowerCase());
    if (!row) return res.status(404).json({ error: 'Label not found for this MUC number' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch label by MUC number' });
  }
});

module.exports = router; 