import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaList, FaTimes, FaUndo, FaMoneyBillWave, FaImage } from 'react-icons/fa';
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
    orderNo: '',
    invoiceNo: '',
    labelNumber: '',
    returnDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    product: '',
    customerName: '',
    address: '',
    qcImage: null,
    remarks: ''
  });

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
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      // Debug log
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }
      await axios.post(`${API_BASE}/api/returns`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Return request submitted successfully');
      setFormData({
        type: 'return',
        onlineOrderId: '',
        orderNo: '',
        invoiceNo: '',
        labelNumber: '',
        returnDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        product: '',
        customerName: '',
        address: '',
        qcImage: null,
        remarks: ''
      });
      fetchReturns();
    } catch (error) {
      toast.error('Failed to submit request');
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
    setFormData(prev => ({
      ...prev,
      qcImage: e.target.files[0]
    }));
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
      await axios.patch(`${API_BASE}/api/returns/${id}`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchReturns();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Handler to auto-fill fields based on Online Order ID
  const handleOnlineOrderIdBlur = async (e) => {
    const orderId = e.target.value;
    if (!orderId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/assignments?orderId=${orderId}`);
      if (response.data && response.data.length > 0) {
        const assignment = response.data[0];
        setFormData(prev => ({
          ...prev,
          status: assignment.status || prev.status,
          product: assignment.labelDetails?.productName || prev.product,
          customerName: assignment.customerName || prev.customerName,
          address: assignment.address || prev.address,
        }));
      }
    } catch (error) {
      // Optionally show a toast or clear fields
    }
  };

  // Handler to auto-fill fields based on Label Number
  const handleLabelNumberBlur = async (e) => {
    const labelNumber = e.target.value;
    if (!labelNumber) {
      setFormData(prev => ({ ...prev, orderNo: '', invoiceNo: '', address: '' }));
      return;
    }
    try {
      // Fetch assignment by label number
      const assignmentRes = await axios.get(`${API_BASE}/api/assignments?labelNumber=${labelNumber}`);
      let orderNo = '';
      let invoiceNo = '';
      let product = '';
      let customerName = '';
      let address = '';
      let status = 'pending';
      if (assignmentRes.data && assignmentRes.data.length > 0) {
        const assignment = assignmentRes.data[0];
        product = assignment.labelDetails?.productName || '';
        customerName = assignment.customerName || '';
        address = assignment.address || '';
        status = assignment.status || 'pending';
      }
      // Always generate next available order/invoice number
      const returnsRes = await axios.get(`${API_BASE}/api/returns`);
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
        status
      }));
    } catch (error) {
      setFormData(prev => ({ ...prev, orderNo: '', invoiceNo: '', address: '' }));
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
                <option value="cancel">Cancel</option>
                <option value="return">Return</option>
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
              <label>Order Number</label>
              <input
                type="text"
                name="orderNo"
                value={formData.orderNo}
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                readOnly
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
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label>Product</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>QC Image</label>
              <input
                type="file"
                name="qcImage"
                onChange={handleFileChange}
                accept="image/*"
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
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
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
                    <th>Order No</th>
                    <th>Invoice No</th>
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
                      <td>{r.orderNo}</td>
                      <td>{r.invoiceNo}</td>
                      <td>{r.labelNumber}</td>
                      <td>{new Date(r.returnDate).toLocaleDateString()}</td>
                      <td>{r.product}</td>
                      <td>{r.customerName}</td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => handleStatusChange(r._id, 'approved')}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleStatusChange(r._id, 'rejected')}
                          title="Reject"
                        >
                          ✕
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