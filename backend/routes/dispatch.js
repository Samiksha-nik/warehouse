const express = require('express');
const router = express.Router();
const Dispatch = require('../models/Dispatch');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/dispatch');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all dispatches
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.mucNumber) {
      query.mucNumber = req.query.mucNumber;
    }
    if (req.query.orderId) {
      query.orderId = req.query.orderId;
    }
    const dispatches = await Dispatch.find(query).sort({ createdAt: -1 });
    res.json(dispatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single dispatch
router.get('/:id', async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.json(dispatch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new dispatch with file upload
router.post('/', upload.fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'productPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const invoiceUrl = req.files && req.files.invoice ? `uploads/dispatch/${req.files.invoice[0].filename}` : '';
    const productPhotoUrl = req.files && req.files.productPhoto ? `uploads/dispatch/${req.files.productPhoto[0].filename}` : '';

    const dispatch = new Dispatch({
      dispatchNo: req.body.dispatchNo,
      dispatchDate: req.body.date,
      customer: req.body.customer,
      orderId: req.body.orderId,
      invoiceUrl: invoiceUrl,
      qrCode: req.body.qrCode,
      productPhotoUrl: productPhotoUrl,
      mucNumber: req.body.mucNumber,
      productName: req.body.productName,
      unit: req.body.unit,
      grade: req.body.grade,
      length: req.body.length,
      width: req.body.width,
      thickness: req.body.thickness,
      totalMm: req.body.totalMm,
      quantity: req.body.quantity,
      bundleNumber: req.body.bundleNumber,
      fromLocation: req.body.fromLocation,
      toLocation: req.body.toLocation,
      address: req.body.address,
      marketplace: req.body.marketplace,
      status: 'pending',
    });

    await dispatch.save();
    res.status(201).json(dispatch);
  } catch (err) {
    console.error('Error creating dispatch:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a dispatch
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Dispatch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.json({ message: 'Dispatch deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Update a dispatch (with file upload support)
router.patch('/:id', upload.fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 },
  { name: 'productPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const update = {
      dispatchNo: req.body.dispatchNo,
      dispatchDate: req.body.dispatchDate,
      customer: req.body.customer,
    };
    if (req.body.status) {
      update.status = req.body.status;
    }
    if (req.files && req.files.invoice) {
      update.invoiceUrl = `uploads/dispatch/${req.files.invoice[0].filename}`;
    }
    if (req.files && req.files.qrCode) {
      update.qrCode = `uploads/dispatch/${req.files.qrCode[0].filename}`;
    }
    if (req.files && req.files.productPhoto) {
      update.productPhotoUrl = `uploads/dispatch/${req.files.productPhoto[0].filename}`;
    }

    const updated = await Dispatch.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard: Dispatches by marketplace and month (last 6 months)
router.get('/dashboard/dispatches-by-platform', async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    // Aggregate dispatches by month and marketplace, only for completed status
    const data = await Dispatch.aggregate([
      {
        $match: {
          dispatchDate: { $gte: sixMonthsAgo },
          status: 'completed'
        }
      },
      {
        $addFields: {
          month: { $month: '$dispatchDate' },
          year: { $year: '$dispatchDate' }
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month', marketplace: '$marketplace' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          platforms: {
            $push: {
              marketplace: '$_id.marketplace',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format result as [{ month: 'Jan', amazon: 5, flipkart: 3 }, ...]
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = data.map(item => {
      const month = monthNames[item._id.month - 1];
      const year = item._id.year;
      const amazon = item.platforms.find(p => p.marketplace === 'Amazon')?.count || 0;
      const flipkart = item.platforms.find(p => p.marketplace === 'Flipkart')?.count || 0;
      return { month: `${month} ${year}`, amazon, flipkart };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dispatches by platform', error: err.message });
  }
});

// Dashboard: Number of dispatches today and this week
router.get('/dashboard/dispatches-today-week', async (req, res) => {
  try {
    const now = new Date();
    // Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Start of week (Monday)
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday as start
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);

    // Count using dispatchDate if present, otherwise fallback to createdAt
    const dispatchesToday = await Dispatch.countDocuments({
      $and: [
        { status: { $ne: 'pending' } },
        {
          $or: [
            { dispatchDate: { $gte: startOfToday, $lte: now } },
            { $and: [ { $or: [ { dispatchDate: { $exists: false } }, { dispatchDate: null } ] }, { createdAt: { $gte: startOfToday, $lte: now } } ] }
          ]
        }
      ]
    });
    const dispatchesThisWeek = await Dispatch.countDocuments({
      $and: [
        { status: { $ne: 'pending' } },
        {
          $or: [
            { dispatchDate: { $gte: startOfWeek, $lte: now } },
            { $and: [ { $or: [ { dispatchDate: { $exists: false } }, { dispatchDate: null } ] }, { createdAt: { $gte: startOfWeek, $lte: now } } ] }
          ]
        }
      ]
    });
    res.json({ dispatchesToday, dispatchesThisWeek });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dispatches today/this week', error: err.message });
  }
});

// Dashboard: Pending dispatches
router.get('/dashboard/pending-dispatches', async (req, res) => {
  try {
    // Assuming 'pending' status is tracked in Dispatch model (add status field if not present)
    // If not, count all dispatches that are not completed/delivered
    // For now, count all dispatches with status 'pending'
    const pendingCount = await Dispatch.countDocuments({ status: 'pending' });
    res.json({ pendingDispatches: pendingCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending dispatches', error: err.message });
  }
});

module.exports = router; 