import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';
import '../../styles/shared.css';
import { toast } from 'react-toastify';
import tableStyles from '../../styles/TableStyles.module.css';
import styles from './StockTransfer.module.css';

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
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [searchMuc, setSearchMuc] = useState('');
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
    type: 'outward',
    vehicleNumber: '',
    destination: '',
    transporter: '',
    productPhoto: null
  });
  const [mucValid, setMucValid] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [outwardTransfers, setOutwardTransfers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        toast.error('This MUC number is already used in an outward transfer. Please enter a unique MUC number.');
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
        toast.success('Product details fetched from inward.');
        setMucValid(true);
      } else {
        handleNoMatch();
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        handleNoMatch();
      } else {
        console.error('Error fetching MUC details:', err);
        toast.error('Error fetching MUC details');
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
    toast.error('There is no MUC number matched.');
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
      setTransfers(response.data);
      setFilteredTransfers(response.data);
      setOutwardTransfers(response.data);
      setLocations(response.data.map(transfer => ({
        value: transfer.fromLocation,
        label: transfer.fromLocation
      })));
    } catch (err) {
      setMessage({ text: 'Error fetching transfers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transferData = {
        ...formData,
        date: formData.date,
        time: formData.time,
        length: Number(formData.length),
        width: Number(formData.width),
        thickness: Number(formData.thickness),
        totalMm: Number(formData.totalMm),
        quantity: Number(formData.quantity),
      };

      let response;
      if (editingId) {
        response = await axios.patch(`http://localhost:5000/api/stock-transfers-outward/${editingId}`, transferData);
        toast.success('Outward Transfer updated successfully!');
      } else {
        response = await axios.post('http://localhost:5000/api/stock-transfers-outward', transferData);
        toast.success('Outward Transfer created successfully!');
      }

      setFormData({
        mucNumber: '',
        productName: '',
        unit: '',
        grade: '',
        length: '',
        width: '',
        thickness: '',
        totalMm: '',
        quantity: '',
        bundleNumber: '',
        fromLocation: '',
        toLocation: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remarks: '',
        type: 'outward',
        vehicleNumber: '',
        destination: '',
        transporter: '',
        productPhoto: null
      });
      setEditingId(null);
      fetchTransfers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving transfer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stock-transfers-outward/${id}`);
        toast.success('Transfer deleted successfully!');
        fetchTransfers();
      } catch (err) {
        toast.error('Error deleting transfer: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEditTransfer = (transfer) => {
    setEditingId(transfer._id);
    setFormData({
      mucNumber: transfer.mucNumber || '',
      productName: transfer.productName || '',
      unit: transfer.unit || '',
      grade: transfer.grade || '',
      length: transfer.length?.toString() || '',
      width: transfer.width?.toString() || '',
      thickness: transfer.thickness?.toString() || '',
      totalMm: transfer.totalMm || '',
      quantity: transfer.quantity?.toString() || '',
      bundleNumber: transfer.bundleNumber || '',
      fromLocation: transfer.fromLocation || '',
      toLocation: transfer.toLocation || '',
      date: transfer.date ? new Date(transfer.date).toISOString().split('T')[0] : '',
      time: transfer.time || '',
      remarks: transfer.remarks || '',
      type: transfer.type || 'outward',
      vehicleNumber: transfer.vehicleNumber || '',
      destination: transfer.destination || '',
      transporter: transfer.transporter || '',
      productPhoto: null
    });
  };

  const handleDeleteTransfer = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stock-transfers-outward/${id}`);
        toast.success('Transfer deleted successfully!');
        fetchTransfers();
      } catch (err) {
        toast.error('Error deleting transfer: ' + (err.response?.data?.message || err.message));
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
          <div className="form-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
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
          </div>
          <div className="form-row">
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
              <label htmlFor="bundleNumber">Bundle Number</label>
              <input
                type="text"
                id="bundleNumber"
                name="bundleNumber"
                value={formData.bundleNumber}
                onChange={handleInputChange}
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
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="form-control"
            ></textarea>
          </div>
        </div>
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className={`btn-primary ${styles.submitButton}`} disabled={!mucValid}>
            {editingId ? 'Update Transfer' : 'Create Transfer'}
          </button>
        </div>
      </form>
    </>
  );

  const renderList = () => (
    <div className="card">
      <h2>Stock Outward List</h2>
      
      {/* Filter row with MUC search */}
      <div className="filter-row">
        <div className="search-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <input
            type="text"
            id="searchMuc"
            value={searchMuc}
            onChange={(e) => setSearchMuc(e.target.value)}
            placeholder="Search MUC number"
            className="form-control"
            style={{ minWidth: 180 }}
          />
          <button onClick={handleMucSearch} className="btn-primary">Search</button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan="15" style={{ textAlign: 'center', color: '#888' }}>No transfers found.</td>
              </tr>
            ) : (
              filteredTransfers.map(transfer => {
                console.log('Rendering transfer:', transfer); // Debug log
                return (
                  <tr key={transfer._id}>
                    <td>{transfer.date ? new Date(transfer.date).toLocaleDateString() : ''}</td>
                    <td>{transfer.mucNumber || ''}</td>
                    <td>{transfer.fromLocation || ''}</td>
                    <td>{transfer.toLocation || ''}</td>
                    <td className={tableStyles.productNameCell}>{transfer.productName || ''}</td>
                    <td>{transfer.unit || ''}</td>
                    <td>{transfer.grade || ''}</td>
                    <td>{transfer.length || ''}</td>
                    <td>{transfer.width || ''}</td>
                    <td>{transfer.thickness || ''}</td>
                    <td>{transfer.totalMm || ''}</td>
                    <td>{transfer.quantity || ''}</td>
                    <td>{transfer.bundleNumber || ''}</td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditTransfer(transfer)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteTransfer(transfer._id)}
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