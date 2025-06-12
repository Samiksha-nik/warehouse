const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Dispatch = require('../models/Dispatch');

// Helper function to convert query parameters to regex for partial matching
const createRegex = (query) => query ? new RegExp(query, 'i') : null;

router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate, productName, grade, fromLocation } = req.query;

    let matchConditions = {};

    // Date filtering (assuming createdAt or similar field in Assignment/Dispatch)
    if (fromDate || toDate) {
      matchConditions.createdAt = {};
      if (fromDate) {
        matchConditions.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        // Set to the end of the day for inclusive date range
        let toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = toDateObj;
      }
    }

    // Prepare regex for product and grade for partial matching
    const productNameRegex = createRegex(productName);
    const gradeRegex = createRegex(grade);
    const lengthValue = parseFloat(req.query.length);
    const widthValue = parseFloat(req.query.width);

    // Fetch incoming stock (assignments)
    let assignmentPipeline = [
      {
        $match: {
          ...matchConditions,
          ...(productNameRegex && { 'labelDetails.productName': productNameRegex }),
          ...(gradeRegex && { 'labelDetails.grade': gradeRegex }),
          ...(lengthValue && { 'labelDetails.length': lengthValue }),
          ...(widthValue && { 'labelDetails.width': widthValue }),
        }
      },
      {
        $group: {
          _id: {
            productName: '$labelDetails.productName',
            grade: '$labelDetails.grade',
            unit: '$labelDetails.unit',
            bundleNumber: '$labelDetails.bundleNumber',
            fromLocation: '$locationStock',
            mucNumber: '$labelNumber' // Add MUC number from Assignment
          },
          totalInwardQuantity: { $sum: '$labelDetails.quantity' }
        }
      }
    ];
    const incomingStock = await Assignment.aggregate(assignmentPipeline);

    // Fetch outgoing stock (dispatches)
    let dispatchPipeline = [
      {
        $match: {
          ...matchConditions, // Apply same date filter
          ...(productNameRegex && { 'productName': productNameRegex }),
          ...(gradeRegex && { 'grade': gradeRegex }),
          ...(lengthValue && { 'length': lengthValue }),
          ...(widthValue && { 'width': widthValue }),
        }
      },
      {
        $group: {
          _id: {
            productName: '$productName',
            grade: '$grade',
            unit: '$unit',
            bundleNumber: '$bundleNumber',
            fromLocation: '$fromLocation',
            mucNumber: '$mucNumber' // Add MUC number from Dispatch
          },
          totalOutgoingQuantity: { $sum: '$quantity' }
        }
      }
    ];
    const outgoingStock = await Dispatch.aggregate(dispatchPipeline);

    // Combine and calculate net stock
    const stockMap = new Map();

    incomingStock.forEach(item => {
      const key = JSON.stringify(item._id);
      stockMap.set(key, { ...item._id, netQuantity: item.totalInwardQuantity });
    });

    outgoingStock.forEach(item => {
      const key = JSON.stringify(item._id);
      if (stockMap.has(key)) {
        const existing = stockMap.get(key);
        existing.netQuantity -= item.totalOutgoingQuantity;
        stockMap.set(key, existing);
      } else {
        // This case should ideally not happen if all outgoing stock has an inward counterpart
        // but included for robustness, indicating negative stock or unassigned outgoing
        stockMap.set(key, { ...item._id, netQuantity: -item.totalOutgoingQuantity });
      }
    });

    // Convert map to array and filter out items with 0 or negative net quantity if desired
    const netStockReport = Array.from(stockMap.values()).filter(item => item.netQuantity > 0);

    res.json(netStockReport);

  } catch (err) {
    console.error('Error generating stock report:', err);
    res.status(500).json({ message: 'Error generating stock report', error: err.message });
  }
});

module.exports = router; 