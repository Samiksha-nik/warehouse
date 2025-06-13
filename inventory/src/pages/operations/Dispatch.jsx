import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import '../../styles/shared.css';
import { FaTrash, FaEdit, FaQrcode } from 'react-icons/fa';
import { debounce } from 'lodash';

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
    marketplace: ''
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
      // Removed console.log statements to declutter
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
        alert('Dispatch deleted successfully!');
        fetchDispatches();
      } catch (err) {
        alert('Error deleting dispatch: ' + (err.response?.data?.message || err.message));
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
      data.append('thickness', Number(formData.thickness));
      data.append('totalMm', Number(formData.totalMm));
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
      if (formData.invoice) data.append('invoice', formData.invoice);
      if (formData.productPhoto) data.append('productPhoto', formData.productPhoto);

      await axios.post('http://localhost:5000/api/dispatch', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Dispatch created successfully!');
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
        invoice: null,
        productPhoto: null
      });
      fetchDispatches();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating dispatch');
    }
  };

  return (
    <div className="page-container">
      <div className='page-content card'>
      <div className="page-header">
        <h1>Dispatch</h1>
      </div>
      <div className="tabs">
        <button className={`tab-button ${activeTab === 'form' ? 'active' : ''}`} onClick={() => { setActiveTab('form'); }}>Create Dispatch</button>
        <button className={`tab-button ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>Dispatch List</button>
      </div>
      <div className="tab-content">
        {activeTab === 'form' ? (
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
            <div className="form-block">
              <div className="form-row">
                <div className="form-group">
                  <label>Invoice</label>
                  <input
                    type="file"
                    name="invoice"
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
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
            </div>
            {message && <div className="message error">{message}</div>}
            <button type="submit" className="btn-primary" disabled={!productValid || !formData.mucNumber || !formData.productName || !formData.unit || !formData.grade || !formData.length || !formData.width || !formData.thickness || !formData.totalMm || !formData.quantity || !formData.fromLocation || !formData.toLocation || !formData.invoice || !formData.productPhoto || !formData.customer || !formData.orderId}>Save Dispatch</button>
          </form>
        ) : (
          <div className="card">
            <h2>Dispatch List</h2>
            {loading ? <p>Loading...</p> : error ? <p className="error">{error}</p> : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Dispatch No.</th>
                    <th>MUC Number</th>
                    <th>Product Photo</th>
                    <th>Customer</th>
                    <th>Order ID</th>
                    <th>Invoice PDF</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map(dispatch => (
                    <tr key={dispatch._id}>
                      <td>{new Date(dispatch.dispatchDate).toLocaleDateString()}</td>
                      <td>{dispatch.dispatchNo}</td>
                      <td>{dispatch.mucNumber}</td>
                      <td>
                        {dispatch.productPhotoUrl ? (
                          <a 
                            href={`http://localhost:5000/${dispatch.productPhotoUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            View Photo
                          </a>
                        ) : (
                          '-' // Display a dash if no photo URL
                        )}
                      </td>
                      <td>{dispatch.customer}</td>
                      <td>{dispatch.orderId}</td>
                      <td>
                        {dispatch.invoiceUrl ? (
                          <button
                            className="view-link"
                            onClick={() => window.open(`http://localhost:5000/${dispatch.invoiceUrl}`, '_blank', 'noopener,noreferrer')}
                            title="View Invoice PDF"
                            type="button"
                          >
                            View
                          </button>
                        ) : '-'}
                      </td>
                      <td>
                        <button className="btn-icon" title="Edit" onClick={() => handleEditDispatch(dispatch)}><FaEdit /></button>
                        <button className="btn-icon" title="Delete" onClick={() => handleDeleteDispatch(dispatch._id)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dispatch; 