import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaList, FaTimes, FaUndo, FaMoneyBillWave, FaImage, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ReturnRefund.css';

const API_BASE = 'http://localhost:5000';

const getNextNumber = (list, prefix) => {
  let max = 0;
  list.forEach(item => {
    const num = item && item.startsWith(prefix + '/') ? parseInt(item.split('/')[1], 10) : 0;
    if (!isNaN(num) && num > max) max = num;
  });
  return `${prefix}/${(max + 1).toString().padStart(3, '0')}`;
};

const ReturnRefund = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    type: 'return',
    onlineOrderId: '',
    labelNumber: '',
    returnDate: new Date().toISOString().split('T')[0],
    product: '',
    customerName: '',
    address: '',
    productPhoto: null,
    remarks: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchReturns();
    fetchLabels();
    fetchCustomers();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/labels`);
      if (response.data && Array.isArray(response.data)) {
        setLabels(response.data);
      } else {
        setLabels([]);
        toast.error('No labels found or invalid response from server.');
      }
    } catch (error) {
      setLabels([]);
      toast.error('Failed to fetch labels');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/returns`);
      setReturns(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch returns');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Add all form fields except the file
      Object.keys(formData).forEach(key => {
        if (key !== 'productPhoto' && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add the file if it exists
      if (formData.productPhoto) {
        formDataToSend.append('productPhoto', formData.productPhoto);
      }

      // Debug log
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      if (editingId) {
        // If editing an existing record, send a PATCH request
        await axios.patch(`${API_BASE}/api/returns/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Return request updated successfully!');
        setEditingId(null); // Clear editing state
      } else {
        // If not editing, create a new record, send a POST request
        await axios.post(`${API_BASE}/api/returns`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Return request submitted successfully');
      }

      setFormData({
        type: 'return',
        onlineOrderId: '',
        labelNumber: '',
        returnDate: new Date().toISOString().split('T')[0],
        product: '',
        customerName: '',
        address: '',
        productPhoto: null,
        remarks: ''
      });
      fetchReturns();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, productPhoto: file }));
  };

  const handleLabelChange = (e) => {
    const selectedLabel = labels.find(label => label.labelNumber === e.target.value);
    if (selectedLabel) {
      setFormData(prev => ({
        ...prev,
        labelNumber: selectedLabel.labelNumber,
        product: selectedLabel.productName,
        customerName: selectedLabel.customerName,
        address: selectedLabel.customerAddress,
      }));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/returns/${id}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchReturns();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleOnlineOrderIdBlur = async (e) => {
    const { value } = e.target;
    if (!value) return;

    // Fetch all returns to check for duplicates
    const returnsRes = await axios.get(`${API_BASE}/api/returns`);
    const existingReturn = returnsRes.data.find(r => r.onlineOrderId === value && r._id !== editingId);

    if (existingReturn) {
      toast.error('This Online Order ID already exists in a return request.');
      setFormData(prev => ({
        ...prev,
        onlineOrderId: '',
        labelNumber: '',
        product: '',
        customerName: '',
        address: ''
      }));
      return; // Stop further processing
    }

    try {
      // Fetch dispatch record by order ID
      const dispatchRes = await axios.get(`${API_BASE}/api/dispatch?orderId=${value}`);
      if (dispatchRes.data && dispatchRes.data.length > 0) {
        const dispatch = dispatchRes.data[0];
        setFormData(prev => ({
          ...prev,
          onlineOrderId: value,
          labelNumber: dispatch.mucNumber || '',
          product: dispatch.productName || '',
          customerName: dispatch.customer || '',
          address: dispatch.address || ''
        }));
      } else {
        toast.error('No dispatch found for this Order ID');
      }
    } catch (error) {
      console.error('Error fetching dispatch details:', error);
      toast.error('Error fetching dispatch details');
    }
  };

  const handleLabelNumberBlur = async (e) => {
    const labelNumber = e.target.value;
    if (!labelNumber) {
      setFormData(prev => ({ ...prev, orderNo: '', invoiceNo: '', address: '' }));
      return;
    }

    // Check if label number already exists in current returns list (for validation)
    const returnsRes = await axios.get(`${API_BASE}/api/returns`);
    const existingReturn = returnsRes.data.find(r => r.labelNumber === labelNumber && r._id !== editingId);
    if (existingReturn) {
      toast.error('This Label Number already exists in a return request.');
      setFormData(prev => ({
        ...prev,
        labelNumber: '',
        orderNo: '',
        invoiceNo: '',
        address: '',
        product: '',
        customerName: '',
        onlineOrderId: ''
      }));
      return; // Stop further processing
    }

    try {
      // First check if the label number exists in dispatch records
      const dispatchRes = await axios.get(`${API_BASE}/api/dispatch?mucNumber=${labelNumber}`);
      if (!dispatchRes.data || dispatchRes.data.length === 0) {
        toast.error('This MUC number has not been dispatched. Only dispatched products can be returned.');
        setFormData(prev => ({
          ...prev,
          labelNumber: '',
          orderNo: '',
          invoiceNo: '',
          address: '',
          product: '',
          customerName: '',
          onlineOrderId: ''
        }));
        return;
      }

      // Get customer details from dispatch record
      const dispatch = dispatchRes.data[0];
      let orderNo = '';
      let invoiceNo = '';
      let product = dispatch.productName || '';
      let customerName = dispatch.customer || '';
      let address = dispatch.address || '';
      let status = 'pending';

      // Always generate next available order/invoice number
      const allOrderNos = returnsRes.data.map(r => r.orderNo).filter(Boolean);
      const allInvoiceNos = returnsRes.data.map(r => r.invoiceNo).filter(Boolean);
      orderNo = getNextNumber(allOrderNos, 'ORN');
      invoiceNo = getNextNumber(allInvoiceNos, 'IN');
      setFormData(prev => ({
        ...prev,
        orderNo,
        invoiceNo,
        product,
        customerName,
        address,
        status,
        onlineOrderId: dispatch.orderId || ''
      }));
    } catch (error) {
      toast.error('Error fetching product details. Please try again.');
      setFormData(prev => ({ ...prev, orderNo: '', invoiceNo: '', address: '' }));
    }
  };

  const handleEditReturn = (returnRequest) => {
    setFormData({
      type: returnRequest.type || 'return',
      onlineOrderId: returnRequest.onlineOrderId || '',
      labelNumber: returnRequest.labelNumber || '',
      returnDate: returnRequest.returnDate ? new Date(returnRequest.returnDate).toISOString().split('T')[0] : '',
      product: returnRequest.product || '',
      customerName: returnRequest.customerName || '',
      address: returnRequest.address || '',
      productPhoto: null, // File input is always null for editing
      remarks: returnRequest.remarks || ''
    });
    setEditingId(returnRequest._id);
    setActiveTab('form');
  };

  const handleDeleteReturn = async (id) => {
    if (window.confirm('Are you sure you want to delete this return request?')) {
      try {
        await axios.delete(`${API_BASE}/api/returns/${id}`);
        toast.success('Return request deleted successfully!');
        // Instead of fetchReturns, which refreshes all data, 
        // you might want to filter the state to remove the deleted item for better UX
        // For now, let's refetch all to ensure consistency
        fetchReturns();
      } catch (err) {
        toast.error('Error deleting return request: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="container">
      <h1>Cancel & Return Management</h1>
      
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <FaPlusCircle className="btn-icon" /> New Request
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FaList className="btn-icon" /> List
        </button>
      </div>

      <div className="content">
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="return">Return</option>
                <option value="cancel">Cancel</option>
                <option value="replacement">Replacement</option>
              </select>
            </div>

            <div className="form-group">
              <label>Online Order ID</label>
              <input
                type="text"
                name="onlineOrderId"
                value={formData.onlineOrderId}
                onChange={handleInputChange}
                onBlur={handleOnlineOrderIdBlur}
                required
              />
            </div>

            <div className="form-group">
              <label>Label Number</label>
              <input
                type="text"
                name="labelNumber"
                value={formData.labelNumber}
                onChange={handleInputChange}
                onBlur={handleLabelNumberBlur}
                required
              />
            </div>

            <div className="form-group">
              <label>Return Date</label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Product</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="productPhoto">Product Photo (JPG/PNG only)</label>
              <input
                type="file"
                id="productPhoto"
                name="productPhoto"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                required
                className="form-control"
              />
              <small className="text-muted">Only JPG and PNG files are allowed</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              Submit Request
            </button>
          </form>
        ) : (
          <div className="list-container">
            <h2>Return Requests</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Online Order ID</th>
                    <th>Label No</th>
                    <th>Return Date</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r._id}>
                      <td>{r.type}</td>
                      <td>{r.onlineOrderId}</td>
                      <td>{r.labelNumber}</td>
                      <td>{new Date(r.returnDate).toLocaleDateString()}</td>
                      <td>{r.product}</td>
                      <td>{r.customerName}</td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        >
                          <option value="rejected">Rejected</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className="btn-icon"
                          onClick={() => handleEditReturn(r)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleDeleteReturn(r._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
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
  );
};

export default ReturnRefund; 