import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      });

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            onScanSuccess(data);
            setIsScanning(false);
            scanner.clear();
          } catch (error) {
            onScanError('Invalid QR code format');
          }
        },
        (error) => {
          onScanError(error);
        }
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      };
    }
  }, [isScanning, onScanSuccess, onScanError]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };

  return (
    <div className="qr-scanner-container bg-white p-4 rounded-lg shadow-md">
      {!isScanning ? (
        <div className="text-center">
          <button
            onClick={startScanning}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Scan QR Code</h3>
            <button
              onClick={stopScanning}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Stop Scanning
            </button>
          </div>
          <div id="qr-reader" className="w-full max-w-md mx-auto border-2 border-gray-200 rounded-lg overflow-hidden"></div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Position the QR code within the frame to scan
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner; 