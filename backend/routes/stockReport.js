const express = require('express');
const router = express.Router();
const StockTransferInward = require('../models/StockTransferInward');
const StockTransferOutward = require('../models/StockTransferOutward');
const Dispatch = require('../models/Dispatch');

// Helper function to convert query parameters to regex for partial matching
const createRegex = (query) => query ? new RegExp(query, 'i') : null;

router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate, productName, grade } = req.query;

    // Create date conditions for each model type
    const inwardDateConditions = {};
    const outwardDateConditions = {};
    const dispatchDateConditions = {};

    if (fromDate || toDate) {
      if (fromDate) {
        inwardDateConditions.date = { $gte: new Date(fromDate) };
        outwardDateConditions.date = { $gte: new Date(fromDate) };
        dispatchDateConditions.dispatchDate = { $gte: new Date(fromDate) };
      }
      if (toDate) {
        let toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999);
        inwardDateConditions.date = { ...inwardDateConditions.date, $lte: toDateObj };
        outwardDateConditions.date = { ...outwardDateConditions.date, $lte: toDateObj };
        dispatchDateConditions.dispatchDate = { ...dispatchDateConditions.dispatchDate, $lte: toDateObj };
      }
    }

    // Prepare regex for product and grade for partial matching
    const productNameRegex = createRegex(productName);
    const gradeRegex = createRegex(grade);

    // Get all inward MUCs
    const inwardMUCs = await StockTransferInward.distinct('mucNumber', {
      ...inwardDateConditions,
      ...(productNameRegex && { productName: productNameRegex }),
      ...(gradeRegex && { grade: gradeRegex }),
    });

    // Get all outward MUCs
    const outwardMUCs = await StockTransferOutward.distinct('mucNumber', {
      ...outwardDateConditions,
      ...(productNameRegex && { productName: productNameRegex }),
      ...(gradeRegex && { grade: gradeRegex }),
    });

    // Get all dispatched MUCs
    const dispatchMUCs = await Dispatch.distinct('mucNumber', {
      ...dispatchDateConditions,
      ...(productNameRegex && { productName: productNameRegex }),
      ...(gradeRegex && { grade: gradeRegex }),
    });

    // Filter to get only available MUCs (inwarded but not outwarded or dispatched)
    const availableMUCs = inwardMUCs.filter(muc => 
      !outwardMUCs.includes(muc) && !dispatchMUCs.includes(muc)
    );

    // Fetch inward stock only for available MUCs
    let inwardPipeline = [
      {
        $match: {
          ...inwardDateConditions,
          ...(productNameRegex && { productName: productNameRegex }),
          ...(gradeRegex && { grade: gradeRegex }),
          mucNumber: { $in: availableMUCs }
        }
      },
      {
        $group: {
          _id: {
            productName: '$productName',
            grade: '$grade',
            unit: '$unit',
            bundleNumber: '$bundleNumber',
            mucNumber: '$mucNumber'
          },
          totalInwardQuantity: { $sum: '$quantity' }
        }
      }
    ];
    const inwardStock = await StockTransferInward.aggregate(inwardPipeline);

    // Convert to final report format
    let stockReport = inwardStock.map(item => ({
      mucNumber: item._id.mucNumber,
      productName: item._id.productName,
      grade: item._id.grade,
      unit: item._id.unit,
      bundleNumber: item._id.bundleNumber,
      totalInward: item.totalInwardQuantity,
      totalOutward: 0,
      totalDispatched: 0,
      remainingQuantity: item.totalInwardQuantity
    }));

    // Fetch length and width for each mucNumber, productName, grade, bundleNumber
    const mucDetails = await StockTransferInward.find({ mucNumber: { $in: availableMUCs } }, { mucNumber: 1, productName: 1, grade: 1, bundleNumber: 1, length: 1, width: 1 }).lean();
    stockReport = stockReport.map(r => {
      const match = mucDetails.find(doc =>
        doc.mucNumber === r.mucNumber &&
        doc.productName === r.productName &&
        doc.grade === r.grade &&
        (doc.bundleNumber || '') === (r.bundleNumber || '')
      );
      return {
        ...r,
        length: match?.length || '',
        width: match?.width || ''
      };
    });

    res.json(stockReport);

  } catch (err) {
    console.error('Error generating stock report:', err);
    res.status(500).json({ message: 'Error generating stock report', error: err.message });
  }
});

// Dashboard: Total number of MUCs in stock
router.get('/dashboard/total-mucs-in-stock', async (req, res) => {
  try {
    // Get all inward MUCs
    const inwardMUCs = await StockTransferInward.distinct('mucNumber');
    // Get all outward MUCs
    const outwardMUCs = await StockTransferOutward.distinct('mucNumber');
    // Get all dispatched MUCs
    const dispatchMUCs = await Dispatch.distinct('mucNumber');
    // Filter to get only available MUCs (inwarded but not outwarded or dispatched)
    const availableMUCs = inwardMUCs.filter(muc => !outwardMUCs.includes(muc) && !dispatchMUCs.includes(muc));
    res.json({ totalMUCsInStock: availableMUCs.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching total MUCs in stock', error: err.message });
  }
});

// Dashboard: Number of items inwarded today and this week
router.get('/dashboard/inwarded-count', async (req, res) => {
  try {
    const now = new Date();
    // Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Start of week (Monday)
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday as start
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);

    const inwardToday = await StockTransferInward.countDocuments({
      date: { $gte: startOfToday, $lte: now }
    });
    const inwardThisWeek = await StockTransferInward.countDocuments({
      date: { $gte: startOfWeek, $lte: now }
    });
    res.json({ inwardedToday: inwardToday, inwardedThisWeek: inwardThisWeek });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inwarded count', error: err.message });
  }
});

module.exports = router;