import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import '../../styles/shared.css';

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
    type: 'outward'
  });

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

  // Fetch label details by MUC number
  const fetchLabelDetails = async (mucNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/labels?mucNumber=${mucNumber}`);
      if (response.data && response.data.length > 0) {
        const label = response.data[0];
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMucBlur = () => {
    if (formData.mucNumber) {
      fetchLabelDetails(formData.mucNumber);
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock-transfers?type=outward');
      setTransfers(response.data);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setMessage({ text: 'Error fetching transfers', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string values to numbers where needed
      const submitData = {
        outwardNo: `OUT-${Date.now()}`, // Generate a unique outward number
        outwardDate: formData.date,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        labelDetails: {
          productName: formData.productName,
          unit: formData.unit,
          grade: formData.grade,
          length: formData.length.toString(),
          width: formData.width.toString(),
          thickness: formData.thickness.toString(),
          totalMm: formData.totalMm.toString(),
          quantity: formData.quantity.toString(),
          bundleNumber: formData.bundleNumber
        },
        type: 'outward',
        status: 'pending',
        notes: formData.remarks
      };

      await axios.post('http://localhost:5000/api/stock-transfers', submitData);
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
        type: 'outward'
      });

      // Refresh the list
      fetchTransfers();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving transfer:', err);
      setMessage({ text: 'Error saving transfer: ' + (err.response?.data?.message || err.message), type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stock-transfers/${id}`);
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
        <h2>New Outward Transfer</h2>
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
        <button type="submit" className="btn-primary">Save Outward Transfer</button>
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
                <td colSpan="14" style={{ textAlign: 'center', color: '#888' }}>No transfers found.</td>
              </tr>
            ) : (
              transfers.map(transfer => (
                <tr key={transfer._id}>
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

export default StockTransferOutward; 