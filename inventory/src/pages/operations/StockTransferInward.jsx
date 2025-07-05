import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaCamera, FaTimes, FaEye } from 'react-icons/fa';
import '../../styles/shared.css';
import styles from './StockTransfer.module.css';
import tableStyles from '../../styles/TableStyles.module.css';
import { toast } from 'react-toastify';

const generateInwardNumber = (lastNumber = 0) => {
  // Example: BB/25-26/IN/001
  const year = new Date().getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const currYear = year.toString().slice(-2);
  const num = (lastNumber + 1).toString().padStart(3, '0');
  return `BB/${currYear}-${nextYear}/IN/${num}`;
};

const StockTransferInward = ({ showForm, showList, onSwitchToForm }) => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [searchMuc, setSearchMuc] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    mucNumber: '',
    inwardNumber: '',
    date: '',
    time: '',
    fromLocation: '',
    toLocation: '',
    productName: '',
    unit: '',
    grade: '',
    length: '',
    width: '',
    thickness: '',
    totalMm: '',
    quantity: '',
    bundleNumber: '',
    remarks: '',
    vehicleNumber: '',
    destination: '',
    transporter: '',
    productPhoto: null,
    type: 'inward'
  });
  const [lastInwardNumber, setLastInwardNumber] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [groupedInward, setGroupedInward] = useState([]);
  const [selectedOutward, setSelectedOutward] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [labels, setLabels] = useState([]);

  // Fetch last inward number for auto-increment
  useEffect(() => {
    const fetchLastInwardNumber = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stock-transfers-inward');
        let maxNumber = 0;
        
        if (response.data && response.data.length > 0) {
          // Find the highest inward number
          response.data.forEach(transfer => {
            const match = transfer.inwardNumber.match(/(\d{3})$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) {
                maxNumber = num;
              }
            }
          });
        }
        
        setLastInwardNumber(maxNumber);
        setFormData(prev => ({
          ...prev,
          inwardNumber: generateInwardNumber(maxNumber)
        }));
      } catch (err) {
        console.error('Error fetching last inward number:', err);
        setLastInwardNumber(0);
        setFormData(prev => ({
          ...prev,
          inwardNumber: generateInwardNumber(0)
        }));
      }
    };
    
    if (showForm) {
      fetchLastInwardNumber();
    }
  }, [showForm]);

  // Set current date and time on mount
  useEffect(() => {
    if (showForm) {
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
  }, [showForm]);

  // Calculate total MM whenever length, width, or thickness changes
  useEffect(() => {
    const calculateTotalMm = () => {
      const length = parseFloat(formData.length) || 0;
      const width = parseFloat(formData.width) || 0;
      const thickness = parseFloat(formData.thickness) || 0;
      if (length > 0 && width > 0 && thickness > 0) {
        const total = length * width * thickness;
        setFormData(prev => ({ ...prev, totalMm: total.toString() }));
      } else {
        setFormData(prev => ({ ...prev, totalMm: '' }));
      }
    };
    calculateTotalMm();
  }, [formData.length, formData.width, formData.thickness]);

  // Fetch label details by MUC number from PDF label set
  const fetchLabelDetails = async (mucNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/pdf-labels/by-muc?mucNumber=${mucNumber}`);
      if (response.data) {
        const label = response.data;
        setFormData(prev => ({
          ...prev,
          productName: label["Product Name"] || '',
          grade: label["Grade"] || '',
          length: label["Length"] || '',
          width: label["Width"] || '',
          totalMm: label["Total MM"] || '',
          quantity: label["Number of PCS"] || '',
          bundleNumber: '',
          // Do not set unit or thickness since they are not in the PDF data
        }));
        setMessage({ text: 'Label details fetched from PDF label set.', type: 'success' });
      } else {
        setFormData(prev => ({
          ...prev,
          productName: '',
          grade: '',
          length: '',
          width: '',
          totalMm: '',
          quantity: '',
          bundleNumber: ''
        }));
        setMessage({ text: 'This MUC number does not exist in PDF label set.', type: 'error' });
        setDialogMessage('This MUC number does not exist in PDF label set.');
        setDialogOpen(true);
      }
    } catch (err) {
      setFormData(prev => ({
        ...prev,
        productName: '',
        grade: '',
        length: '',
        width: '',
        totalMm: '',
        quantity: '',
        bundleNumber: ''
      }));
      setMessage({ text: 'This MUC number does not exist in PDF label set.', type: 'error' });
      setDialogMessage('This MUC number does not exist in PDF label set.');
      setDialogOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'productPhoto') {
      setFormData(prev => ({ ...prev, productPhoto: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Helper to check for duplicate MUC
  const isDuplicateMuc = (muc) => {
    return transfers.some(t => t.mucNumber.trim().toLowerCase() === muc.trim().toLowerCase());
  };

  const handleMucBlur = () => {
    if (formData.mucNumber) {
      if (isDuplicateMuc(formData.mucNumber)) {
        setMessage({ text: 'This MUC number already exists in inward transfers.', type: 'error' });
        setFormData(prev => ({ ...prev, mucNumber: '' }));
        return;
      }
      fetchLabelDetails(formData.mucNumber);
    }
  };

  useEffect(() => {
    if (showForm || showList) {
      fetchTransfers();
    }
  }, [showForm, showList]);

  // Add useEffect for filtering
  useEffect(() => {
    if (searchMuc) {
      const filtered = transfers.filter(transfer => 
        transfer.mucNumber.toLowerCase().includes(searchMuc.toLowerCase())
      );
      setFilteredTransfers(filtered);
    } else {
      setFilteredTransfers(transfers);
    }
  }, [searchMuc, transfers]);

  // Effect to handle camera stream
  useEffect(() => {
    if (showCamera) {
      const enableStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setMessage({ text: 'Could not access the camera. Please check permissions.', type: 'error' });
          setShowCamera(false);
        }
      };
      enableStream();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    
    // Cleanup stream on component unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCamera]);

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock-transfers-inward');
      setTransfers(response.data);
      setFilteredTransfers(response.data);
    } catch (err) {
      setMessage({ text: 'Error fetching transfers', type: 'error' });
    }
  };

  const handleEditTransfer = (transfer) => {
    console.log('Edit button clicked for transfer:', transfer);
    console.log('onSwitchToForm prop:', onSwitchToForm);
    
    // Convert date to yyyy-MM-dd format for HTML date input
    const formattedDate = transfer.date ? new Date(transfer.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    setFormData({
      mucNumber: transfer.mucNumber || '',
      inwardNumber: transfer.inwardNumber || '',
      date: formattedDate,
      time: transfer.time || '',
      fromLocation: transfer.fromLocation || '',
      toLocation: transfer.toLocation || '',
      productName: transfer.productName || '',
      unit: transfer.unit || '',
      grade: transfer.grade || '',
      length: transfer.length || '',
      width: transfer.width || '',
      thickness: transfer.thickness || '',
      totalMm: transfer.totalMm || '',
      quantity: transfer.quantity || '',
      bundleNumber: transfer.bundleNumber || '',
      remarks: transfer.remarks || '',
      vehicleNumber: transfer.vehicleNumber || '',
      destination: transfer.destination || '',
      transporter: transfer.transporter || '',
      productPhoto: null,
      type: 'inward'
    });
    setEditingId(transfer._id);
    console.log('Form data set, editingId set to:', transfer._id);
    
    // Switch to form view
    if (onSwitchToForm) {
      console.log('Calling onSwitchToForm...');
      onSwitchToForm();
    } else {
      console.log('onSwitchToForm is not available');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Defensive: Remove totalMm if not a valid number before sending
      const cleanedFormData = { ...formData };
      if (
        cleanedFormData.totalMm === '' ||
        cleanedFormData.totalMm === undefined ||
        cleanedFormData.totalMm === null ||
        isNaN(Number(cleanedFormData.totalMm))
      ) {
        delete cleanedFormData.totalMm;
      }
      console.log('Submitting formData:', cleanedFormData);
      const formDataToSend = new FormData();
      Object.keys(cleanedFormData).forEach(key => {
        if (key === 'productPhoto' && cleanedFormData[key]) {
          formDataToSend.append(key, cleanedFormData[key]);
        } else if (key !== 'productPhoto') {
          formDataToSend.append(key, cleanedFormData[key]);
        }
      });

      if (editingId) {
        // Update existing transfer
        await axios.patch(`http://localhost:5000/api/stock-transfers-inward/${editingId}`, formDataToSend);
        toast.success('Inward transfer updated successfully!');
        setEditingId(null);
      } else {
        // Create new transfer
        await axios.post('http://localhost:5000/api/stock-transfers-inward', formDataToSend);
        toast.success('Inward transfer created successfully!');
      }

      // Reset form
        setFormData({
          mucNumber: '',
        inwardNumber: generateInwardNumber(lastInwardNumber),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fromLocation: '',
          toLocation: '',
          productName: '',
          unit: '',
          grade: '',
          length: '',
          width: '',
          thickness: '',
          totalMm: '',
          quantity: '',
          bundleNumber: '',
          remarks: '',
          vehicleNumber: '',
          destination: '',
          transporter: '',
          productPhoto: null,
          type: 'inward'
        });

      fetchTransfers();
          setMessage({ text: '', type: '' });
    } catch (error) {
      console.error('Error saving transfer:', error);
      toast.error('Error saving transfer: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stock-transfers-inward/${id}`);
        toast.success('Transfer deleted successfully!');
        fetchTransfers();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (err) {
        console.error('Error deleting transfer:', err);
        toast.error('Error deleting transfer');
      }
    }
  };

  // --- Camera Control Functions ---

  const handleTakePhotoClick = () => {
    setShowCamera(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `product-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFormData(prev => ({ ...prev, productPhoto: file }));
          setCapturedImage(URL.createObjectURL(blob));
          handleCloseCamera();
          setMessage({ text: 'Photo captured successfully!', type: 'success' });
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, productPhoto: null }));
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  // Fetch labels on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/pdf-labels')
      .then(res => setLabels(res.data))
      .catch(() => setLabels([]));
  }, []);

  // Group transfers by outward number from label
  useEffect(() => {
    const group = {};
    transfers.forEach(t => {
      // Find label for this MUC number (case-insensitive, trimmed)
      const label = labels.find(
        l => l.mucNumber && t.mucNumber &&
          l.mucNumber.trim().toLowerCase() === t.mucNumber.trim().toLowerCase()
      );
      console.log('Comparing:', t.mucNumber, 'with labels:', labels.map(l => l.mucNumber), 'Found label:', label);
      const outwardNum = label && label.outwardNumber ? label.outwardNumber : 'Unknown';
      if (!group[outwardNum]) group[outwardNum] = [];
      group[outwardNum].push(t);
    });
    setGroupedInward(Object.entries(group));
  }, [transfers, labels]);

  const renderForm = () => (
    <>
      <style>{`
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }
        .form-block {
          margin-bottom: 32px;
          padding: 16px 0;
          border-bottom: 1px solid #eee;
        }
        @media (max-width: 700px) {
          .form-row {
            flex-direction: column;
          }
          .form-block {
            padding: 0;
          }
        }
      `}</style>
      <div className="card">
        <h2>{editingId ? 'Update Inward Transfer' : 'Add New Inward Transfer'}</h2>
        <form onSubmit={handleSubmit} className="form-container" encType="multipart/form-data">
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
          {/* Top Block */}
          <div className="form-block">
            <div className="form-row">
              <div className="form-group">
                <label>MUC Number*</label>
                <input type="text" name="mucNumber" value={formData.mucNumber} onChange={handleInputChange} onBlur={e => {
                  if (!isDuplicateMuc(formData.mucNumber)) {
                    handleMucBlur();
                  }
                }} required className={styles.formControl} onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    if (isDuplicateMuc(formData.mucNumber)) {
                      setMessage({ text: 'This MUC number already exists in inward transfers.', type: 'error' });
                      setFormData(prev => ({ ...prev, mucNumber: '' }));
                    } else {
                      handleMucBlur();
                    }
                  }
                }} />
              </div>
              <div className="form-group">
                <label>Inward Number*</label>
                <input type="text" name="inwardNumber" value={formData.inwardNumber} readOnly className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date & Time*</label>
                <input type="text" value={`${formData.date} ${formData.time}`} readOnly className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>From Location*</label>
                <input type="text" name="fromLocation" value={formData.fromLocation} onChange={handleInputChange} required className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>To Location*</label>
                <input type="text" name="toLocation" value={formData.toLocation} onChange={handleInputChange} required className={styles.formControl} />
              </div>
            </div>
          </div>
          {/* Product Details Block */}
          <div className="form-block">
            <div className="form-row">
              <div className="form-group">
                <label>Product Name*</label>
                <input type="text" name="productName" value={formData.productName} readOnly required className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>Unit*</label>
                <input type="text" name="unit" value={formData.unit} readOnly required className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Grade*</label>
                <input type="text" name="grade" value={formData.grade} readOnly required className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>Length*</label>
                <input type="number" step="0.01" name="length" value={formData.length} readOnly required className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Width*</label>
                <input type="number" step="0.01" name="width" value={formData.width} readOnly required className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>Thickness*</label>
                <input type="number" step="0.01" name="thickness" value={formData.thickness} readOnly className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Total MM*</label>
                <input type="number" step="0.01" name="totalMm" value={formData.totalMm} readOnly className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>Quantity*</label>
                <input type="number" step="0.01" name="quantity" value={formData.quantity} readOnly required className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bundle Number</label>
                <input type="text" name="bundleNumber" value={formData.bundleNumber} onChange={handleInputChange} className={styles.formControl} />
              </div>
            </div>
          </div>
          {/* Vehicle Block */}
          <div className="form-block">
            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Number</label>
                <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>Destination*</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} required className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Transporter*</label>
                <input type="text" name="transporter" value={formData.transporter} onChange={handleInputChange} required className={styles.formControl} />
              </div>
              <div className="form-group">
                <label>Product Photo</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {!capturedImage ? (
                    <button 
                      type="button" 
                      onClick={handleTakePhotoClick}
                      className="btn-secondary"
                      style={{ 
                        padding: '8px 12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <FaCamera />
                      Take Photo
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <img 
                        src={capturedImage} 
                        alt="Captured product" 
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }} 
                      />
                      <button 
                        type="button" 
                        onClick={removePhoto}
                        className="btn-secondary"
                        style={{ 
                          padding: '4px 8px',
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px'
                        }}
                      >
                        <FaTimes />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Camera Interface */}
            {showCamera && (
              <div className="form-block" style={{ 
                marginTop: '16px', 
                padding: '16px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '12px' 
                }}>
                  <h4 style={{ margin: 0 }}>Take Product Photo</h4>
                  <button 
                    type="button" 
                    onClick={handleCloseCamera}
                    className="btn-secondary"
                    style={{ padding: '4px 8px' }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: '400px', 
                  margin: '0 auto' 
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #ddd'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '12px', 
                    marginTop: '12px' 
                  }}>
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      className="btn-primary"
                      style={{ 
                        padding: '8px 16px',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px'
                      }}
                    >
                      <FaCamera />
                      Capture Photo
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Remarks</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} className={styles.formControl} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Inward Transfer' : 'Save Inward Transfer'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({
                mucNumber: '',
                inwardNumber: generateInwardNumber(lastInwardNumber),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fromLocation: '',
                toLocation: '',
                productName: '',
                unit: '',
                grade: '',
                length: '',
                width: '',
                thickness: '',
                totalMm: '',
                quantity: '',
                bundleNumber: '',
                remarks: '',
                vehicleNumber: '',
                destination: '',
                transporter: '',
                productPhoto: null,
                type: 'inward'
              });
              setCapturedImage(null);
              setShowCamera(false);
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );

  const renderList = () => (
    <div className="card">
      <h2>Stock Inward List</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Outward Number</th>
              <th>Inward Count</th>
            </tr>
          </thead>
          <tbody>
            {groupedInward.length === 0 ? (
              <tr><td colSpan="2" style={{ textAlign: 'center', color: '#888' }}>No inward records found.</td></tr>
            ) : (
              groupedInward.map(([outward, records]) => (
                <tr key={outward}>
                  <td>{outward}</td>
                  <td>
                    <button className="btn-link" style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
                      onClick={() => { setSelectedOutward({ outward, records }); setShowDetailsModal(true); }}>
                      {records.length}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showDetailsModal && selectedOutward && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: '90vw', minWidth: 900, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 22 }}>Inward Details for Outward Number: {selectedOutward.outward}</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 1100 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Inward No.</th>
                    <th>MUC Number</th>
                    <th>From Location</th>
                    <th>To Location</th>
                    <th style={{ maxWidth: 180, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Product Name</th>
                    <th>Unit</th>
                    <th>Grade</th>
                    <th>Length</th>
                    <th>Width</th>
                    <th>Thickness</th>
                    <th>Total MM</th>
                    <th>Quantity</th>
                    <th>Bundle Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOutward.records.map(transfer => (
                    <tr key={transfer._id}>
                      <td>{new Date(transfer.date).toLocaleDateString()}</td>
                      <td>{transfer.inwardNumber}</td>
                      <td>{transfer.mucNumber}</td>
                      <td>{transfer.fromLocation}</td>
                      <td>{transfer.toLocation}</td>
                      <td style={{ maxWidth: 180, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{transfer.productName}</td>
                      <td>{transfer.unit}</td>
                      <td>{transfer.grade}</td>
                      <td>{transfer.length}</td>
                      <td>{transfer.width}</td>
                      <td>{transfer.thickness}</td>
                      <td>{transfer.totalMm}</td>
                      <td>{transfer.quantity}</td>
                      <td>{transfer.bundleNumber}</td>
                      <td>
                        <button className="btn-icon" onClick={() => handleDelete(transfer._id)} title="Delete"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleMucSearch = () => {
    if (searchMuc) {
      const filtered = transfers.filter(transfer => 
        transfer.mucNumber.toLowerCase().includes(searchMuc.toLowerCase())
      );
      setFilteredTransfers(filtered);
    } else {
      setFilteredTransfers(transfers);
    }
  };

  return (
    <div className="container">
      {showForm && renderForm()}
      {showList && renderList()}
      {dialogOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', padding: 24, borderRadius: 8, minWidth: 300, boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <div style={{ marginBottom: 16 }}>{dialogMessage}</div>
            <button onClick={() => setDialogOpen(false)} style={{ padding: '6px 18px' }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransferInward; 