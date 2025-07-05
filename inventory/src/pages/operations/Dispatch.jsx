import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import '../../styles/shared.css';
import { FaTrash, FaEdit, FaQrcode, FaTruck } from 'react-icons/fa';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

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

const styles = `
  .container {
    padding: 20px;
    max-width: 100%;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .tab {
    padding: 10px 20px;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
    font-weight: 500;
  }

  .tab.active {
    background: #007bff;
    color: white;
  }

  .content-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .table-container {
    overflow-x: auto;
    margin-top: 20px;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  .data-table th,
  .data-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .data-table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  .data-table tr:hover {
    background-color: #f5f5f5;
  }

  .dispatch-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dispatch-button:hover {
    background-color: #218838;
  }

  .loading {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: #666;
  }

  .error {
    color: #dc3545;
    padding: 10px;
    margin: 10px 0;
    background-color: #f8d7da;
    border-radius: 4px;
  }
`;

const Dispatch = () => {
  const [activeTab, setActiveTab] = useState('outward');
  const [customers, setCustomers] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [outwardTransfers, setOutwardTransfers] = useState([]);
  const [formData, setFormData] = useState({
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
    customer: '',
    dispatchNo: '',
    dispatchDate: '',
    orderId: '',
    invoice: null,
    qrCode: null,
    address: '',
    marketplace: '',
    vehicleNumber: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productValid, setProductValid] = useState(false);
  const [message, setMessage] = useState('');
  const productPhotoInputRef = useRef(null);

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
    if (activeTab === 'outward') {
      fetchOutwardTransfers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
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
      console.error('Error fetching assignment:', err);
    }
  };

  const fetchAssignmentDetailsByLabelNumber = async (labelNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignments?labelNumber=${labelNumber}`);
      // Ensure exact match only
      const assignment = response.data && response.data.find(a => a.labelNumber === labelNumber);
      if (assignment) {
        setFormData(prev => ({
          ...prev,
          productName: assignment.labelDetails?.productName || '',
          unit: assignment.labelDetails?.unit || '',
          grade: assignment.labelDetails?.grade || '',
          length: assignment.labelDetails?.length || '',
          width: assignment.labelDetails?.width || '',
          thickness: assignment.labelDetails?.thickness || '',
          totalMm: assignment.labelDetails?.totalMm || '',
          quantity: assignment.labelDetails?.quantity || '',
          bundleNumber: assignment.labelDetails?.bundleNumber || '',
          fromLocation: assignment.locationStock || '',
          customer: assignment.customerName || '',
          marketplace: assignment.marketplace || '',
          address: assignment.address || ''
        }));
        setProductValid(true);
        setMessage('');
      } else {
        setProductValid(false);
        setMessage('No assignment found for this MUC number.');
        // Only clear product-specific details, DO NOT clear customer/fromLocation here
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
          // fromLocation: '', // REMOVED: Allow manual input
          // customer: '', // REMOVED: Allow manual input
          marketplace: '',
          address: ''
        }));
      }
    } catch (err) {
      setProductValid(false);
      setMessage('Error fetching assignment details.');
      // Only clear product-specific details on error, DO NOT clear customer/fromLocation here
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
        // fromLocation: '', // REMOVED: Allow manual input
        // customer: '', // REMOVED: Allow manual input
        toLocation: '',
        orderId: '',
        marketplace: '',
        address: ''
      }));
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

  useEffect(() => {
    // Only require fields that are filled by the user, not read-only/blank fields
    const requiredFields = [
      'mucNumber', 'fromLocation', 'toLocation', 'customer', 'orderId', 'vehicleNumber'
    ];
    const allFilled = requiredFields.every(field => formData[field]);
    setProductValid(allFilled);
  }, [formData]);

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
        console.error('Error scanning QR code:', err);
      }
    } else if (name === 'productPhoto') {
      setFormData(prev => ({ ...prev, productPhoto: files[0] }));
    }
  };

  const handleScanPhoto = () => {
    if (productPhotoInputRef.current) {
      productPhotoInputRef.current.click();
    }
  };

  const handleEditDispatch = (dispatch) => {
    setFormData({
      dispatchNo: dispatch.dispatchNo,
      dispatchDate: dispatch.dispatchDate ? new Date(dispatch.dispatchDate).toISOString().split('T')[0] : '',
      customer: dispatch.customer,
      invoice: null,
      qrCode: null
    });
    setEditingId(dispatch._id);
    setActiveTab('form');
  };

  const handleDeleteDispatch = async (id) => {
    if (window.confirm('Are you sure you want to delete this dispatch?')) {
      try {
        await axios.delete(`http://localhost:5000/api/dispatch/${id}`);
        toast.success('Dispatch deleted successfully!');
        fetchDispatches();
      } catch (err) {
        toast.error('Error deleting dispatch: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const fetchProductDetails = async (mucNumber) => {
    try {
      if (!mucNumber) return;
      
      setMessage('Fetching product details...');
      console.log('Fetching details for MUC number:', mucNumber);

      // Fetch details from assignments
      const response = await axios.get(`http://localhost:5000/api/assignments/label/${mucNumber}`);
      const product = response.data;
      
      console.log('Raw API Response:', product);
      console.log('Label Details:', product?.labelDetails);
      console.log('Grade from labelDetails:', product?.labelDetails?.grade);
      console.log('TotalMM from labelDetails:', product?.labelDetails?.totalMM);

      if (!product) {
        setProductValid(false);
        setMessage('This MUC number is not found in assignments.');
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
          // fromLocation: '', // REMOVED: Allow manual input
          // customer: '',
          toLocation: '',
          orderId: '',
          marketplace: '',
          address: ''
        }));
        return;
      }

      // Update form data with details from assignment and its nested labelDetails
      setFormData(prev => ({
        ...prev,
        productName: product.labelDetails?.productName || '',
        unit: product.labelDetails?.unit || '',
        grade: product.labelDetails?.grade || '',
        length: product.labelDetails?.length || '',
        width: product.labelDetails?.width || '',
        thickness: product.labelDetails?.thickness || '',
        totalMm: product.labelDetails?.totalMm || '',
        quantity: product.labelDetails?.quantity || '',
        bundleNumber: product.labelDetails?.bundleNumber || '',
        fromLocation: product.locationStock || '',
        // toLocation should be manually entered as it's the destination for dispatch
        orderId: product.orderId || '',
        marketplace: product.marketplace || '',
        address: product.address || ''
      }));
      
      setProductValid(true);
      setMessage('Product details fetched and validated.');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProductValid(false);
        setMessage('This MUC number is not found in assignments.');
      } else {
        console.error('Error fetching product details from assignments:', err);
        setProductValid(false);
        setMessage('Error fetching product details. Please try again.');
      }
      // Clear product details on error
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
        // fromLocation: '', // REMOVED: Allow manual input
        // customer: '',
        toLocation: '',
        orderId: '',
        marketplace: '',
        address: ''
      }));
    }
  };

  // Add debouncing to prevent too many API calls
  const debouncedFetchProductDetails = useCallback(
    debounce((mucNumber) => {
      fetchProductDetails(mucNumber);
    }, 300),
    []
  );

  const handleMucBlur = () => {
    if (formData.mucNumber) {
      debouncedFetchProductDetails(formData.mucNumber);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('mucNumber', formData.mucNumber);
      data.append('productName', formData.productName);
      data.append('unit', formData.unit);
      data.append('grade', formData.grade);
      data.append('length', Number(formData.length));
      data.append('width', Number(formData.width));
      // Only append thickness if valid
      if (formData.thickness !== '' && formData.thickness !== undefined && formData.thickness !== null && !isNaN(Number(formData.thickness))) {
        data.append('thickness', Number(formData.thickness));
      }
      // Only append totalMm if valid
      if (formData.totalMm !== '' && formData.totalMm !== undefined && formData.totalMm !== null && !isNaN(Number(formData.totalMm))) {
        data.append('totalMm', Number(formData.totalMm));
      }
      data.append('quantity', Number(formData.quantity));
      data.append('bundleNumber', formData.bundleNumber);
      data.append('fromLocation', formData.fromLocation);
      data.append('toLocation', formData.toLocation);
      data.append('dispatchNo', formData.dispatchNo);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('customer', formData.customer);
      data.append('orderId', formData.orderId);
      data.append('address', formData.address);
      data.append('marketplace', formData.marketplace);
      data.append('vehicleNumber', formData.vehicleNumber);
      if (formData.productPhoto) data.append('productPhoto', formData.productPhoto);

      await axios.post('http://localhost:5000/api/dispatch', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Dispatch created successfully!');
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
        dispatchNo: '',
        date: '',
        time: '',
        customer: '',
        orderId: '',
        productPhoto: null,
        vehicleNumber: ''
      });
      fetchDispatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating dispatch');
    }
  };

  // Add status update handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/dispatch/${id}`, { status: newStatus });
      setDispatches(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const fetchOutwardTransfers = async () => {
    try {
      setLoading(true);
      const outwardResponse = await axios.get('http://localhost:5000/api/stockTransfersOutward');
      setOutwardTransfers(outwardResponse.data);
      setError(null);
    } catch (err) {
      setError('Error fetching outward transfers: ' + err.message);
      toast.error('Failed to fetch outward transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchClick = async (mucNumber) => {
    try {
      setLoading(true);
      // Fetch outward data
      const mucResponse = await axios.get(`http://localhost:5000/api/stockTransfersOutward/muc/${mucNumber}`);
      const outwardData = mucResponse.data;

      // Fetch assignment data for marketplace, orderId, thickness, totalMm
      let marketplace = '';
      let orderId = '';
      let thickness = outwardData.thickness;
      let totalMm = outwardData.totalMm;
      try {
        const assignmentResponse = await axios.get(`http://localhost:5000/api/assignments?labelNumber=${mucNumber}`);
        const assignment = assignmentResponse.data && assignmentResponse.data.length > 0 ? assignmentResponse.data[0] : null;
        if (assignment) {
          marketplace = assignment.marketplace || '';
          orderId = assignment.orderId || '';
          // Try to get thickness and totalMm from assignment.labelDetails if not present in outward
          if ((!thickness || thickness === '') && assignment.labelDetails?.thickness) {
            thickness = assignment.labelDetails.thickness;
          }
          if ((!totalMm || totalMm === '') && assignment.labelDetails?.totalMm) {
            totalMm = assignment.labelDetails.totalMm;
          }
        }
      } catch (err) {
        // If assignment fetch fails, just leave as is
        console.warn('Could not fetch assignment for marketplace/orderId/thickness/totalMm:', err);
      }

      // Populate form data
      setFormData(prev => ({
        ...prev,
        mucNumber: outwardData.mucNumber,
        productName: outwardData.productName,
        unit: outwardData.unit,
        grade: outwardData.grade,
        length: outwardData.length,
        width: outwardData.width,
        thickness: thickness,
        totalMm: totalMm,
        quantity: outwardData.quantity,
        bundleNumber: outwardData.bundleNumber,
        fromLocation: outwardData.fromLocation,
        toLocation: outwardData.toLocation,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        marketplace,
        orderId,
        customer: outwardData.customerName || '',
        customerName: outwardData.customerName || '',
        address: outwardData.address || '',
        productPhoto: prev.productPhoto, // preserve already uploaded photo if present
        vehicleNumber: prev.vehicleNumber // preserve already entered vehicle number
      }));
      setTimeout(() => setProductValid(true), 0); // ensure productValid is set after formData update

      // Switch to form tab
      setActiveTab('form');
      toast.success('Outward transfer details loaded successfully');
    } catch (err) {
      setError('Error fetching outward transfer details: ' + err.message);
      toast.error('Failed to load outward transfer details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'outward' ? 'active' : ''}`}
            onClick={() => setActiveTab('outward')}
          >
            Outward Transfers
          </button>
          <button
            className={`tab ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Create Dispatch
          </button>
          <button
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Dispatch List
          </button>
        </div>

        {activeTab === 'outward' && (
          <div className="content-section">
            <h2>Outward Transfers Available for Dispatch</h2>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MUC Number</th>
                    <th>Date</th>
                    <th>Product Name</th>
                    <th>From Location</th>
                    <th>To Location</th>
                    <th>Quantity</th>
                    <th>Invoice</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {outwardTransfers.map((transfer) => {
                    const dispatched = dispatches.some(d => d.mucNumber === transfer.mucNumber && d.status === 'completed');
                    return (
                      <tr key={transfer._id}>
                        <td>{transfer.mucNumber}</td>
                        <td>{new Date(transfer.date).toLocaleDateString()}</td>
                        <td>{transfer.productName}</td>
                        <td>{transfer.fromLocation}</td>
                        <td>{transfer.toLocation}</td>
                        <td>{transfer.quantity}</td>
                        <td>
                          {transfer.invoice ? (
                            <a
                              href={`http://localhost:5000/uploads/${transfer.invoice}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="invoice-link"
                            >
                              View Invoice
                            </a>
                          ) : (
                            <span style={{ color: '#888' }}>No Invoice</span>
                          )}
                        </td>
                        <td>
                          {dispatched ? (
                            <button className="action-button dispatch-button" disabled style={{ backgroundColor: '#aaa', cursor: 'not-allowed' }}>Dispatched</button>
                          ) : (
                            <button
                              className="action-button dispatch-button"
                              onClick={() => handleDispatchClick(transfer.mucNumber)}
                            >
                              <FaTruck /> Dispatch
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="form-container">
            <h2>Create Dispatch</h2>
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
                    className="form-input"
                    required
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        handleMucBlur();
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Dispatch No*</label>
                  <input
                    type="text"
                    name="dispatchNo"
                    value={formData.dispatchNo}
                    readOnly
                    className="form-input"
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
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Customer*</label>
                  {console.log('Customer field readOnly:', productValid && !!formData.customer, 'productValid:', productValid, 'formData.customer:', formData.customer)}
                  <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>From Location*</label>
                  {console.log('From Location field readOnly:', productValid && !!formData.fromLocation, 'productValid:', productValid, 'formData.fromLocation:', formData.fromLocation)}
                  <input 
                    type="text" 
                    name="fromLocation" 
                    value={formData.fromLocation} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>To Location*</label>
                  <input type="text" name="toLocation" value={formData.toLocation} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Address*</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    rows="3"
                    placeholder="Enter delivery address"
                  />
                </div>
                <div className="form-group">
                  <label>Marketplace</label>
                  <input
                    type="text"
                    name="marketplace"
                    value={formData.marketplace}
                    readOnly
                    className="form-input readonly-input"
                  />
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
                <div className="form-group">
                  <label>Order ID</label>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Number*</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Product Photo</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="file"
                    name="productPhoto"
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ flex: 1, marginRight: '10px' }}
                    accept="image/*"
                    capture="camera"
                    ref={productPhotoInputRef}
                  />
                  <button type="button" className="btn-secondary" onClick={handleScanPhoto}>Scan Photo</button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={!productValid}>Save Dispatch</button>
          </form>
        )}

        {activeTab === 'list' && (
          <div className="card">
            <h2>Dispatch List</h2>
            {loading ? <p>Loading...</p> : error ? <p className="error">{error}</p> : (
              <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                <table className="data-table" style={{ minWidth: 1100 }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Dispatch No.</th>
                      <th>MUC Number</th>
                      <th>Product Photo</th>
                      <th>Customer</th>
                      <th>Order ID</th>
                      <th>Marketplace</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center', width: 80 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.map(dispatch => (
                      <tr key={dispatch._id}>
                        <td>{new Date(dispatch.dispatchDate).toLocaleDateString()}</td>
                        <td>{dispatch.dispatchNo}</td>
                        <td>{dispatch.mucNumber}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          {dispatch.productPhotoUrl ? (
                            <a 
                              href={`http://localhost:5000/${dispatch.productPhotoUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
                            >
                              View Photo
                            </a>
                          ) : (
                            '-' // Display a dash if no photo URL
                          )}
                        </td>
                        <td>{dispatch.customer}</td>
                        <td>{dispatch.orderId}</td>
                        <td>{dispatch.marketplace || '-'}</td>
                        <td>
                          <select value={dispatch.status || 'pending'} onChange={e => handleStatusChange(dispatch._id, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <button className="btn-icon" title="Delete" onClick={() => handleDeleteDispatch(dispatch._id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Dispatch; 