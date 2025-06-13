import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import '../../styles/shared.css';
import styles from './StockTransfer.module.css';
import tableStyles from '../../styles/TableStyles.module.css';

const generateInwardNumber = (lastNumber = 0) => {
  // Example: BB/25-26/IN/001
  const year = new Date().getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const currYear = year.toString().slice(-2);
  const num = (lastNumber + 1).toString().padStart(3, '0');
  return `BB/${currYear}-${nextYear}/IN/${num}`;
};

const StockTransferInward = ({ showForm, showList }) => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [searchMuc, setSearchMuc] = useState('');
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
    type: 'inward'
  });
  const [lastInwardNumber, setLastInwardNumber] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

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

  // Fetch label details by MUC number from manual label list
  const fetchLabelDetails = async (mucNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/labels?mucNumber=${mucNumber}`);
      if (response.data && response.data.length > 0) {
        const label = response.data[0];
        setFormData(prev => ({
          ...prev,
          productName: label.productName || '',
          unit: label.unit || '',
          grade: label.gradeValue || '',
          length: label.length || '',
          width: label.width || '',
          thickness: label.thickness || '',
          totalMm: label.totalMM || '',
          quantity: label.quantity || '',
          bundleNumber: label.bundleNumber || ''
        }));
        setMessage({ text: 'Label details fetched from manual label.', type: 'success' });
      } else {
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
        setMessage({ text: 'This MUC number does not exist in manual label list.', type: 'error' });
        setDialogMessage('This MUC number does not exist in manual label list.');
        setDialogOpen(true);
      }
    } catch (err) {
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
      setMessage({ text: 'This MUC number does not exist in manual label list.', type: 'error' });
      setDialogMessage('This MUC number does not exist in manual label list.');
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

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock-transfers-inward');
      setTransfers(response.data);
      setFilteredTransfers(response.data);
    } catch (err) {
      setMessage({ text: 'Error fetching transfers', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      // Format numeric fields
      const numericFields = ['length', 'width', 'thickness', 'totalMm', 'quantity'];
      numericFields.forEach(field => {
        submitData.append(field, parseFloat(formData[field]) || 0);
      });

      // Format date
      const formattedDate = new Date(formData.date).toISOString();
      
      // Add all other fields
      submitData.append('mucNumber', formData.mucNumber);
      submitData.append('inwardNumber', formData.inwardNumber);
      submitData.append('date', formattedDate);
      submitData.append('time', formData.time);
      submitData.append('fromLocation', formData.fromLocation);
      submitData.append('toLocation', formData.toLocation);
      submitData.append('productName', formData.productName);
      submitData.append('unit', formData.unit);
      submitData.append('grade', formData.grade);
      submitData.append('bundleNumber', formData.bundleNumber);
      submitData.append('remarks', formData.remarks || '');
      submitData.append('vehicleNumber', formData.vehicleNumber || '');
      submitData.append('destination', formData.destination || '');
      submitData.append('transporter', formData.transporter || '');
      
      if (formData.productPhoto) {
        submitData.append('productPhoto', formData.productPhoto);
      }

      const response = await axios.post('http://localhost:5000/api/stock-transfers-inward', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201) {
        setMessage({ text: 'Transfer saved successfully!', type: 'success' });
        // Reset form and fetch updated data
        fetchTransfers();
        // Get the current highest inward number
        const response = await axios.get('http://localhost:5000/api/stock-transfers-inward');
        let maxNumber = 0;
        
        if (response.data && response.data.length > 0) {
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

        // Reset form with next inward number
        setLastInwardNumber(maxNumber);
        setFormData({
          mucNumber: '',
          inwardNumber: generateInwardNumber(maxNumber),
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

        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      }
    } catch (err) {
      console.error('Error saving transfer:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message;
      setMessage({ 
        text: `Error saving transfer: ${errorMessage}. Please check all required fields are filled correctly.`, 
        type: 'error' 
      });
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
      <div className="card">
        <form onSubmit={handleSubmit} className="form-container" encType="multipart/form-data">
          <h2>Inward Transfer</h2>
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
          {/* Top Block */}
          <div className="form-block">
            <div className="form-row">
              <div className="form-group">
                <label>MUC Number*</label>
                <input type="text" name="mucNumber" value={formData.mucNumber} onChange={handleInputChange} onBlur={handleMucBlur} required className={styles.formControl} />
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
                <input type="number" step="0.01" name="thickness" value={formData.thickness} readOnly required className={styles.formControl} />
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
                <label>Vehicle Number*</label>
                <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} required className={styles.formControl} />
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
                <input type="file" name="productPhoto" accept="image/*" onChange={handleInputChange} className={styles.formControl} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Remarks</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} className={styles.formControl} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Inward Transfer</button>
        </form>
      </div>
    </>
  );

  const renderList = () => (
    <div className="card">
      <h2>Stock Inward List</h2>
      
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
              <th style={{ whiteSpace: 'nowrap' }}>Inward No.</th>
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
              filteredTransfers.map(transfer => (
                <tr key={transfer._id}>
                  <td>{new Date(transfer.date).toLocaleDateString()}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{transfer.inwardNumber}</td>
                  <td>{transfer.mucNumber}</td>
                  <td>{transfer.fromLocation}</td>
                  <td>{transfer.toLocation}</td>
                  <td className={tableStyles.productNameCell}>{transfer.productName}</td>
                  <td>{transfer.unit}</td>
                  <td>{transfer.grade}</td>
                  <td>{transfer.length}</td>
                  <td>{transfer.width}</td>
                  <td>{transfer.thickness}</td>
                  <td>{transfer.totalMm}</td>
                  <td>{transfer.quantity}</td>
                  <td>{transfer.bundleNumber}</td>
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