const jsQR = require('jsqr');
const Jimp = require('jimp');

const processQRCode = async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'No QR code image provided' });
    }

    console.log('Received file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Read the image file
    const image = await Jimp.read(req.file.buffer);
    console.log('Image read successfully');

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

    console.log('Image converted to RGBA');

    // Process the QR code
    const code = jsQR(imageData, width, height);
    
    if (!code) {
      console.error('No QR code found in image');
      return res.status(400).json({ error: 'No QR code found in image' });
    }

    console.log('QR code decoded successfully:', code.data);

    try {
      // Parse the QR code data
      const qrData = JSON.parse(code.data);
      console.log('QR code data parsed successfully:', qrData);
      res.json(qrData);
    } catch (parseError) {
      console.error('Error parsing QR code data:', parseError);
      console.log('Raw QR code data:', code.data);
      res.status(400).json({
        error: 'Invalid QR code data format',
        details: parseError.message,
        rawData: code.data
      });
    }
  } catch (error) {
    console.error('Error processing QR code:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
};

module.exports = {
  processQRCode
}; 