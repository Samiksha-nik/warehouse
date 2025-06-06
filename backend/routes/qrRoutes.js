const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const jsQR = require('jsqr');
const Jimp = require('jimp');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// QR Code scanning endpoint
router.post('/scan', upload.single('qrCode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Processing QR code file:', req.file.path);

    // Read the image file
    const image = await Jimp.read(req.file.path);
    
    // Get image data
    const width = image.getWidth();
    const height = image.getHeight();
    const imageData = new Uint8ClampedArray(width * height * 4);
    
    // Convert image to RGBA
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixelColor(x, y);
        const idx = (y * width + x) * 4;
        imageData[idx] = (pixel >> 24) & 255;     // R
        imageData[idx + 1] = (pixel >> 16) & 255; // G
        imageData[idx + 2] = (pixel >> 8) & 255;  // B
        imageData[idx + 3] = pixel & 255;         // A
      }
    }

    // Process the QR code
    const code = jsQR(imageData, width, height);
    
    if (!code) {
      throw new Error('No QR code found in image');
    }

    console.log('QR code decoded:', code.data);

    // Parse the QR code data
    const qrData = JSON.parse(code.data);
    console.log('Parsed QR code data:', qrData);

    // Clean up the uploaded file
    await unlinkAsync(req.file.path);

    // Return the label details
    res.json({
      qrCode: qrData.labelNumber || '',
      labelDetails: {
        productName: qrData.productName || '',
        unit: qrData.unit || '',
        grade: qrData.gradeValue || '',
        length: qrData.length || '',
        width: qrData.width || '',
        thickness: qrData.thickness || '',
        totalMm: qrData.totalMM || '',
        quantity: qrData.quantity || '',
        bundleNumber: qrData.bundleNumber || ''
      }
    });
  } catch (error) {
    console.error('QR Code scanning error:', error);
    if (req.file) {
      // Clean up the uploaded file in case of error
      await unlinkAsync(req.file.path).catch(console.error);
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 