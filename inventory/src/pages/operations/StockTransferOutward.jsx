import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import '../../styles/shared.css';

// Debounce function to limit API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const StockTransferOutward = ({ showForm, showList }) => {
  const [transfers, setTransfers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    mucNumber: '',
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
    status: 'Pending',
    type: 'outward',
    vehicleNumber: '',
    destination: '',
    transporter: '',
    productPhoto: null
  });
  const [mucValid, setMucValid] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    if (showList) {
      fetchTransfers();
    }
  }, [showList]);

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

  // Fetch product details by MUC number from inward transfers (strict match)
  const fetchInwardDetails = async (mucNumber) => {
    if (!mucNumber) {
      setMucValid(false);
      return;
    }

    try {
      // Check if this MUC number is already used in outward transfers
      const outwardResponse = await axios.get(`http://localhost:5000/api/stock-transfers-outward/check-muc/${mucNumber}`);
      if (outwardResponse.data.exists) {
        setMessage({ text: 'This MUC number is already used in an outward transfer.', type: 'error' });
        setDialogMessage('This MUC number is already used in an outward transfer. Please enter a unique MUC number.');
        setDialogOpen(true);
        setMucValid(false);
        // Clear the MUC number field and all related fields
        setFormData(prev => ({
          ...prev,
          mucNumber: '',
          productName: '',
          unit: '',
          grade: '',
          length: '',
          width: '',
          thickness: '',
          totalMm: '',
          quantity: '',
          bundleNumber: ''
        }));
        return;
      }

      // If not used in outward, check inward transfers
      const response = await axios.get(`http://localhost:5000/api/stock-transfers-inward/muc/${mucNumber}`);
      const match = response.data;
      
      if (match) {
        setFormData(prev => ({
          ...prev,
          productName: match.productName || '',
          unit: match.unit || '',
          grade: match.grade || '',
          length: match.length || '',
          width: match.width || '',
          thickness: match.thickness || '',
          totalMm: match.totalMm || '',
          quantity: match.quantity || '',
          bundleNumber: match.bundleNumber || ''
        }));
        setMessage({ text: 'Product details fetched from inward.', type: 'success' });
        setMucValid(true);
      } else {
        handleNoMatch();
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        handleNoMatch();
      } else {
        console.error('Error fetching MUC details:', err);
        setMessage({ text: 'Error fetching MUC details', type: 'error' });
        setMucValid(false);
      }
    }
  };

  // Helper function to handle no match case
  const handleNoMatch = () => {
    setFormData(prev => ({
      ...prev,
      productName: '',
      unit: '',
      grade: '',
      length: '',
      width: '',
      thickness: '',
      totalMm: '',
      quantity: '',
      bundleNumber: ''
    }));
    setMessage({ text: 'There is no MUC number matched.', type: 'error' });
    setDialogMessage('There is no MUC number matched.');
    setDialogOpen(true);
    setMucValid(false);
  };

  // Create a debounced version of fetchInwardDetails
  const debouncedFetchInwardDetails = useCallback(
    debounce((mucNumber) => {
      fetchInwardDetails(mucNumber);
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'productPhoto') {
      setFormData(prev => ({ ...prev, productPhoto: files[0] }));
    } else {
      if (name === 'mucNumber') {
        // Just update the value without fetching
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleMucBlur = () => {
    const mucNumber = formData.mucNumber.trim();
    if (mucNumber) {
      fetchInwardDetails(mucNumber);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const mucNumber = formData.mucNumber.trim();
      if (mucNumber) {
        fetchInwardDetails(mucNumber);
      }
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock-transfers-outward');
      console.log('Fetched transfers:', response.data); // Debug log
      setTransfers(response.data);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setMessage({ text: 'Error fetching transfers', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if MUC is not valid
    if (!mucValid) {
      setMessage({ text: 'Please enter a unique MUC number before submitting.', type: 'error' });
      setDialogMessage('Please enter a unique MUC number before submitting.');
      setDialogOpen(true);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('mucNumber', formData.mucNumber);
      submitData.append('date', formData.date);
      submitData.append('fromLocation', formData.fromLocation);
      submitData.append('toLocation', formData.toLocation);
      submitData.append('productName', formData.productName);
      submitData.append('unit', formData.unit);
      submitData.append('grade', formData.grade);
      submitData.append('length', formData.length);
      submitData.append('width', formData.width);
      submitData.append('thickness', formData.thickness);
      submitData.append('totalMm', formData.totalMm);
      submitData.append('quantity', formData.quantity);
      submitData.append('bundleNumber', formData.bundleNumber);
      submitData.append('remarks', formData.remarks);
      submitData.append('status', formData.status);
      submitData.append('vehicleNumber', formData.vehicleNumber);
      submitData.append('destination', formData.destination);
      submitData.append('transporter', formData.transporter);
      if (formData.productPhoto) {
        submitData.append('productPhoto', formData.productPhoto);
      }

      const response = await axios.post('http://localhost:5000/api/stock-transfers-outward', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ text: 'Transfer saved successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        mucNumber: '',
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
        status: 'Pending',
        type: 'outward',
        vehicleNumber: '',
        destination: '',
        transporter: '',
        productPhoto: null
      });

      // Refresh the list
      fetchTransfers();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving transfer:', err);
      if (err.response && err.response.status === 400) {
        setMessage({ text: err.response.data.message, type: 'error' });
        setDialogMessage(err.response.data.message);
        setDialogOpen(true);
      } else {
        setMessage({ text: 'Error saving transfer: ' + (err.response?.data?.message || err.message), type: 'error' });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stock-transfers-outward/${id}`);
        setMessage({ text: 'Transfer deleted successfully!', type: 'success' });
        fetchTransfers();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (err) {
        console.error('Error deleting transfer:', err);
        setMessage({ text: 'Error deleting transfer', type: 'error' });
      }
    }
  };

  const renderForm = () => (
    <>
      <style>{`
        .form-row { display: flex; gap: 16px; }
        .form-row .form-group { flex: 1; }
        .form-block { margin-bottom: 32px; padding: 16px 0; border-bottom: 1px solid #eee; }
        @media (max-width: 700px) {
          .form-row { flex-direction: column; }
          .form-block { padding: 0; }
        }
      `}</style>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Outward Transfer</h2>
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
        {/* Top Block */}
        <div className="form-block">
          <div className="form-row">
            <div className="form-group">
              <label>MUC Number*</label>
              <input
                type="text"
                name="mucNumber"
                value={formData.mucNumber}
                onChange={handleInputChange}
                onBlur={handleMucBlur}
                onKeyPress={handleKeyPress}
                required
              />
            </div>
            <div className="form-group">
              <label>Date & Time*</label>
              <input
                type="text"
                value={`${formData.date} ${formData.time}`}
                readOnly
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>From Location*</label>
              <input
                type="text"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>To Location*</label>
              <input
                type="text"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>
        {/* Product Details Block */}
        <div className="form-block">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name*</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <label>Unit*</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                readOnly
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Grade*</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <label>Length*</label>
              <input
                type="number"
                step="0.01"
                name="length"
                value={formData.length}
                readOnly
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Width*</label>
              <input
                type="number"
                step="0.01"
                name="width"
                value={formData.width}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <label>Thickness*</label>
              <input
                type="number"
                step="0.01"
                name="thickness"
                value={formData.thickness}
                readOnly
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total MM*</label>
              <input
                type="number"
                step="0.01"
                name="totalMm"
                value={formData.totalMm}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity*</label>
              <input
                type="number"
                step="0.01"
                name="quantity"
                value={formData.quantity}
                readOnly
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bundle Number*</label>
              <input
                type="text"
                name="bundleNumber"
                value={formData.bundleNumber}
                readOnly
                required
              />
            </div>
          </div>
        </div>
        {/* Vehicle Block */}
        <div className="form-block">
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Transporter</label>
              <input
                type="text"
                name="transporter"
                value={formData.transporter}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Product Photo</label>
              <input
                type="file"
                name="productPhoto"
                accept="image/*"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={!mucValid}>Save Outward Transfer</button>
      </form>
    </>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Outward Transfers List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search transfers..."
            className="form-control search-input"
            // onChange={handleSearch} // Optional: implement search logic
          />
        </div>
      </div>
      <div className="table-container">
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>MUC Number</th>
              <th>From Location</th>
              <th>To Location</th>
              <th>Product Name</th>
              <th>Unit</th>
              <th>Grade</th>
              <th>Length</th>
              <th>Width</th>
              <th>Thickness</th>
              <th>Total MM</th>
              <th>Quantity</th>
              <th>Bundle Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan="15" style={{ textAlign: 'center', color: '#888' }}>No transfers found.</td>
              </tr>
            ) : (
              transfers.map(transfer => {
                console.log('Rendering transfer:', transfer); // Debug log
                return (
                  <tr key={transfer._id}>
                    <td>{transfer.date ? new Date(transfer.date).toLocaleDateString() : ''}</td>
                    <td>{transfer.mucNumber || ''}</td>
                    <td>{transfer.fromLocation || ''}</td>
                    <td>{transfer.toLocation || ''}</td>
                    <td>{transfer.productName || ''}</td>
                    <td>{transfer.unit || ''}</td>
                    <td>{transfer.grade || ''}</td>
                    <td>{transfer.length || ''}</td>
                    <td>{transfer.width || ''}</td>
                    <td>{transfer.thickness || ''}</td>
                    <td>{transfer.totalMm || ''}</td>
                    <td>{transfer.quantity || ''}</td>
                    <td>{transfer.bundleNumber || ''}</td>
                    <td>
                      <span className={`status-badge ${transfer.status ? transfer.status.toLowerCase() : ''}`}>
                        {transfer.status || ''}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(transfer._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

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

export default StockTransferOutward; 