import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import '../../styles/shared.css';

const generateInwardNumber = (lastNumber = 0) => {
  // Example: BB/25-26/IN/001
  const year = new Date().getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const currYear = year.toString().slice(-2);
  const num = (lastNumber + 1).toString().padStart(3, '0');
  return `BB/${currYear}-${nextYear}/IN/${num}`;
};

const StockTransferInward = ({ showForm, showList }) => {
  console.log('showList:', showList);
  const [transfers, setTransfers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
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
    status: 'Pending',
    type: 'inward'
  });
  const [lastInwardNumber, setLastInwardNumber] = useState(0);

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

  // Fetch last inward number for auto-increment
  useEffect(() => {
    const fetchLastInwardNumber = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stock-transfers-inward');
        if (response.data && response.data.length > 0) {
          // Extract last number from the latest inwardNumber
          const last = response.data[0].inwardNumber;
          if (last) {
            const match = last.match(/(\d{3})$/);
            setLastInwardNumber(match ? parseInt(match[1], 10) : 0);
          }
        }
      } catch (err) {
        setLastInwardNumber(0);
      }
    };
    if (showForm) fetchLastInwardNumber();
  }, [showForm]);

  // Set inward number when lastInwardNumber changes
  useEffect(() => {
    if (showForm) {
      setFormData(prev => ({ ...prev, inwardNumber: generateInwardNumber(lastInwardNumber) }));
    }
  }, [lastInwardNumber, showForm]);

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

  // Fetch label details by MUC number
  const fetchLabelDetails = async (mucNumber) => {
    try {
      // Replace with your actual label API endpoint and query param
      const response = await axios.get(`http://localhost:5000/api/labels?mucNumber=${mucNumber}`);
      if (response.data && response.data.length > 0) {
        const label = response.data[0];
        console.log(label); // Debug: see what the label API returns
        setFormData(prev => ({
          ...prev,
          productName: label.productName || '',
          unit: label.unit || '',
          grade: label.grade || label.gradeValue || '',
          length: label.length || '',
          width: label.width || '',
          thickness: label.thickness || '',
          totalMm: label.totalMm || '',
          quantity: label.quantity || '',
          bundleNumber: label.bundleNumber || ''
        }));
        setMessage({ text: 'Label details fetched!', type: 'success' });
      } else {
        setMessage({ text: 'No label found for this MUC number.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error fetching label details.', type: 'error' });
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

  const handleMucBlur = () => {
    if (formData.mucNumber) {
      fetchLabelDetails(formData.mucNumber);
    }
  };

  useEffect(() => {
    if (showList) {
      fetchTransfers();
    }
  }, [showList]);

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock-transfers-inward');
      setTransfers(response.data);
      console.log('Fetched transfers:', response.data);
    } catch (err) {
      setMessage({ text: 'Error fetching transfers', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('mucNumber', formData.mucNumber);
      submitData.append('inwardNumber', formData.inwardNumber);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
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
      submitData.append('vehicleNumber', formData.vehicleNumber);
      submitData.append('destination', formData.destination);
      submitData.append('transporter', formData.transporter);
      submitData.append('status', 'Pending');
      if (formData.productPhoto) {
        submitData.append('productPhoto', formData.productPhoto);
      }
      await axios.post('http://localhost:5000/api/stock-transfers-inward', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ text: 'Transfer saved successfully!', type: 'success' });
      setFormData({
        mucNumber: '',
        inwardNumber: generateInwardNumber(lastInwardNumber + 1),
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
        status: 'Pending',
        type: 'inward'
      });
      fetchTransfers();
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (err) {
      setMessage({ text: 'Error saving transfer: ' + (err.response?.data?.message || err.message), type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stock-transfers-inward/${id}`);
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
      <form onSubmit={handleSubmit} className="form-container" encType="multipart/form-data">
        <h2>New Inward Transfer</h2>
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
                required
              />
            </div>
            <div className="form-group">
              <label>Inward Number*</label>
              <input
                type="text"
                name="inwardNumber"
                value={formData.inwardNumber}
                readOnly
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
          </div>
          <div className="form-row">
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
                className="readonly-input"
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
        {/* Bottom Block */}
        <div className="form-block">
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle Number*</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Destination*</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Transporter*</label>
              <input
                type="text"
                name="transporter"
                value={formData.transporter}
                onChange={handleInputChange}
                required
              />
            </div>
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
        </div>
        <button type="submit" className="btn-primary">Save Inward Transfer</button>
      </form>
    </>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Inward Transfers List</div>
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
        {console.log('Transfers:', transfers)}
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>MUC Number</th>
              <th>Date</th>
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
              transfers.map(transfer => (
                <tr key={transfer._id}>
                  <td>{transfer.mucNumber || ''}</td>
                  <td>{transfer.date ? new Date(transfer.date).toLocaleDateString() : ''}</td>
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
              ))
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
    </div>
  );
};

export default StockTransferInward; 