import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/shared.css';
import { FaTrash, FaEdit, FaQrcode } from 'react-icons/fa';

const getCurrentFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) {
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  }
};

const Dispatch = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [customers, setCustomers] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [formData, setFormData] = useState({
    dispatchNo: '',
    date: '',
    time: '',
    mucNumber: '',
    platform: '',
    invoice: null,
    productPhoto: null,
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
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productValid, setProductValid] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchDispatches();
    if (activeTab === 'form') {
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      generateDispatchNo();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/customers');
      setCustomers(response.data);
    } catch (err) {
      setError('Error fetching customers: ' + err.message);
    }
  };

  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/dispatch');
      setDispatches(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching dispatches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateDispatchNo = async () => {
    try {
      const fy = getCurrentFinancialYear();
      const response = await axios.get('http://localhost:5000/api/dispatch');
      const filtered = response.data.filter(d => d.dispatchNo && d.dispatchNo.includes(`/DSP/`) && d.dispatchNo.includes(fy));
      let maxNum = 0;
      filtered.forEach(d => {
        const match = d.dispatchNo.match(/DSP\/(\d{3})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = (maxNum + 1).toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, dispatchNo: `BB/${fy}/DSP/${nextNum}` }));
    } catch {
      setFormData(prev => ({ ...prev, dispatchNo: `BB/${getCurrentFinancialYear()}/DSP/001` }));
    }
  };

  const fetchAssignmentByLabelNumber = async (labelNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignments?labelNumber=${labelNumber}`);
      if (response.data && response.data.length > 0) {
        setFormData(prev => ({ ...prev, customer: response.data[0].customerName }));
      }
    } catch (err) {
      setFormData(prev => ({ ...prev, customer: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'invoice' || name === 'productPhoto') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (name === 'qrCode' && files[0]) {
      setFormData(prev => ({ ...prev, qrCode: files[0] }));
      const formDataFile = new FormData();
      formDataFile.append('qrCode', files[0]);
      try {
        const response = await axios.post('http://localhost:5000/api/labels/scan', formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.qrCode) {
          fetchAssignmentByLabelNumber(response.data.qrCode);
        }
      } catch (err) {
        setFormData(prev => ({ ...prev, customer: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleEditDispatch = (dispatch) => {
    setFormData({
      dispatchNo: dispatch.dispatchNo,
      dispatchDate: dispatch.dispatchDate ? new Date(dispatch.dispatchDate).toISOString().split('T')[0] : '',
      customer: dispatch.customer,
      invoice: null, // File input is always null for editing
      qrCode: null  // File input is always null for editing
    });
    setEditingId(dispatch._id);
    setActiveTab('form');
  };

  const handleDeleteDispatch = async (id) => {
    if (window.confirm('Are you sure you want to delete this dispatch?')) {
      try {
        await axios.delete(`http://localhost:5000/api/dispatch/${id}`);
        alert('Dispatch deleted successfully!');
        fetchDispatches();
      } catch (err) {
        alert('Error deleting dispatch: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleMucBlur = () => {
    if (formData.mucNumber) {
      fetchProductDetails(formData.mucNumber);
    }
  };

  const fetchProductDetails = async (mucNumber) => {
    try {
      // Validate against outward assignments
      const outwardRes = await axios.get(`http://localhost:5000/api/stock-transfers/outward?mucNumber=${mucNumber}`);
      if (!outwardRes.data || outwardRes.data.length === 0) {
        setProductValid(false);
        setMessage('This MUC number is not assigned in Outward.');
        // Clear product details
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
          bundleNumber: '',
          fromLocation: '',
          toLocation: ''
        }));
        return;
      }
      const product = outwardRes.data[0];
      setFormData(prev => ({
        ...prev,
        productName: product.productName || '',
        unit: product.unit || '',
        grade: product.grade || product.gradeValue || '',
        length: product.length || '',
        width: product.width || '',
        thickness: product.thickness || '',
        totalMm: product.totalMm || '',
        quantity: product.quantity || '',
        bundleNumber: product.bundleNumber || '',
        fromLocation: product.fromLocation || '',
        toLocation: product.toLocation || ''
      }));
      setProductValid(true);
      setMessage('Product details fetched and validated.');
    } catch (err) {
      setProductValid(false);
      setMessage('This MUC number is not assigned in Outward.');
      // Clear product details
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
        bundleNumber: '',
        fromLocation: '',
        toLocation: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productValid) {
      setMessage('Product is not valid for dispatch.');
      return;
    }
    if (!formData.platform) {
      setMessage('Please select a platform.');
      return;
    }
    if (!formData.invoice) {
      setMessage('Please upload the invoice.');
      return;
    }
    if (!formData.productPhoto) {
      setMessage('Please upload the product photo.');
      return;
    }
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      await axios.post('http://localhost:5000/api/dispatch', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Dispatch created successfully!');
      setFormData({
        dispatchNo: '',
        date: '',
        time: '',
        mucNumber: '',
        platform: '',
        invoice: null,
        productPhoto: null,
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
      });
      setProductValid(false);
      generateDispatchNo();
    } catch (err) {
      setMessage('Error saving dispatch: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dispatch</h1>
      </div>
      <div className="tabs">
        <button className={`tab-button ${activeTab === 'form' ? 'active' : ''}`} onClick={() => { setActiveTab('form'); }}>Create Dispatch</button>
        <button className={`tab-button ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>Dispatch List</button>
      </div>
      <div className="page-content">
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-block">
              <div className="form-row">
                <div className="form-group">
                  <label>Dispatch No</label>
                  <input type="text" name="dispatchNo" value={formData.dispatchNo} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input type="text" value={`${formData.date} ${formData.time}`} readOnly className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>MUC Number*</label>
                  <input type="text" name="mucNumber" value={formData.mucNumber} onChange={handleInputChange} onBlur={handleMucBlur} required className="form-input" />
                </div>
                <div className="form-group">
                  <label>Platform*</label>
                  <select name="platform" value={formData.platform} onChange={handleInputChange} required className="form-input">
                    <option value="">Select Platform</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>From Location*</label>
                  <input type="text" name="fromLocation" value={formData.fromLocation} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>To Location*</label>
                  <input type="text" name="toLocation" value={formData.toLocation} readOnly className="form-input" />
                </div>
              </div>
            </div>
            <div className="form-block">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="productName" value={formData.productName} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input type="text" name="unit" value={formData.unit} readOnly className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Grade</label>
                  <input type="text" name="grade" value={formData.grade} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Length</label>
                  <input type="number" name="length" value={formData.length} readOnly className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Width</label>
                  <input type="number" name="width" value={formData.width} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Thickness</label>
                  <input type="number" name="thickness" value={formData.thickness} readOnly className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total MM</label>
                  <input type="number" name="totalMm" value={formData.totalMm} readOnly className="form-input" />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} readOnly className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bundle Number</label>
                  <input type="text" name="bundleNumber" value={formData.bundleNumber} readOnly className="form-input" />
                </div>
              </div>
            </div>
            <div className="form-block">
              <div className="form-row">
                <div className="form-group">
                  <label>Upload Invoice*</label>
                  <input type="file" name="invoice" accept="application/pdf,image/*" onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label>Upload Product Photo*</label>
                  <input type="file" name="productPhoto" accept="image/*" onChange={handleInputChange} className="form-input" required />
                </div>
              </div>
            </div>
            {message && <div className="message error">{message}</div>}
            <button type="submit" className="btn-primary" disabled={!productValid || !formData.platform || !formData.invoice || !formData.productPhoto}>Save Dispatch</button>
          </form>
        ) : (
          <div className="card">
            <h2>Dispatch List</h2>
            {loading ? <p>Loading...</p> : error ? <p className="error">{error}</p> : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dispatch No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Invoice</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map(d => (
                    <tr key={d._id}>
                      <td>{d.dispatchNo}</td><td>{d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString() : '-'}</td><td>{d.customer}</td><td>{d.invoiceUrl ? <a href={`http://localhost:5000${d.invoiceUrl}`} target="_blank" rel="noopener noreferrer">View</a> : '-'}</td><td><button className="btn-icon" title="Edit" onClick={() => handleEditDispatch(d)}><FaEdit /></button><button className="btn-icon" title="Delete" onClick={() => handleDeleteDispatch(d._id)}><FaTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dispatch; 