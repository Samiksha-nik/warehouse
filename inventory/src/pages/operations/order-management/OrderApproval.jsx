import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaCheck, FaTimes, FaSave, FaEdit, FaTrash } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import axios from 'axios';
import '../../../styles/shared.css';
import styles from '../../../styles/TableStyles.module.css';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const OrderApproval = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderNo: '',
    orderDate: '',
    billingAddressId: '',
    deliveryAddressId: '',
    paymentTerms: '',
    deliveryDate: '',
    remark: '',
    poNo: '',
    products: [{
      srNo: 1,
      productName: '',
      unit: '',
      gradeValue: '',
      basicRate: 0,
      length: 0,
      width: 0,
      thickness: 0,
      spUnit: 0,
      quantity: 0,
      bundle: 0,
      basicAmount: 0,
      cgstAmt: 0,
      sgstAmt: 0
    }],
    totalQuantity: 0,
    totalAmount: 0,
    totalWeight: 0,
    totalMM: 0,
    orderStatus: '',
    cgst: 0,
    sgst: 0,
    igst: 0,
    tcs: '',
    finalTotal: 0
  });
  const [addresses, setAddresses] = useState([]);
  const [billingAddress, setBillingAddress] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  useEffect(() => {
    fetchAllOrders();
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (formData && formData.customerId) {
      fetchCustomerAddresses(formData.customerId);
    }
  }, [formData.customerId]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders', { headers: getAuthHeaders() });
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/addresses/', { headers: getAuthHeaders() });
      setAddresses(response.data);
    } catch (err) {
      setAddresses([]);
    }
  };

  // Update fetchCustomerAddresses to use customerId
  const fetchCustomerAddresses = async (customerId) => {
    try {
      const response = await axios.get('http://localhost:5000/api/addresses/', { headers: getAuthHeaders() });
      const customerAddresses = response.data.filter(addr => addr.customerId === customerId);
      setBillingAddress(customerAddresses[0] || null);
      setDeliveryAddress(customerAddresses[0] || null);
    } catch (err) {
      setBillingAddress(null);
      setDeliveryAddress(null);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/orders/${orderId}/approve`, {}, { headers: getAuthHeaders() });
      fetchAllOrders();
      setError(null);
    } catch (err) {
      setError('Failed to approve order');
      console.error('Error approving order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (orderId) => {
    if (window.confirm('Are you sure you want to reject this order?')) {
      try {
        setLoading(true);
        await axios.put(`http://localhost:5000/api/orders/${orderId}/reject`, {}, { headers: getAuthHeaders() });
        fetchAllOrders();
        setError(null);
      } catch (err) {
        setError('Failed to reject order');
        console.error('Error rejecting order:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // When editing an order, set customerId in formData
  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      orderNo: order.orderNumber || '',
      orderDate: order.orderDate ? order.orderDate.split('T')[0] : '',
      billingAddressId: order.billingAddressId || '',
      deliveryAddressId: order.deliveryAddressId || '',
      paymentTerms: order.paymentTerms || '',
      deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : '',
      remark: order.remark || '',
      poNo: order.poNo || '',
      products: order.products || [],
      totalQuantity: order.totalQuantity || 0,
      totalAmount: order.totalAmount || 0,
      totalWeight: order.totalWeight || 0,
      totalMM: order.totalMM || 0,
      orderStatus: order.orderStatus || '',
      cgst: order.cgst || 0,
      sgst: order.sgst || 0,
      igst: order.igst || 0,
      tcs: order.tcs || '',
      finalTotal: order.finalTotal || 0,
      customerId: order.customerId || ''
    });
    setActiveTab('add-new');
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`, { headers: getAuthHeaders() });
        fetchAllOrders();
        setError(null);
      } catch (err) {
        setError('Failed to delete order');
        console.error('Error deleting order:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        srNo: prev.products.length + 1,
        productName: '',
        unit: '',
        gradeValue: '',
        basicRate: 0,
        length: 0,
        width: 0,
        thickness: 0,
        spUnit: 0,
        quantity: 0,
        bundle: 0,
        basicAmount: 0,
        cgstAmt: 0,
        sgstAmt: 0
      }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleReset = () => {
    setFormData({
      orderNo: '',
      orderDate: '',
      billingAddressId: '',
      deliveryAddressId: '',
      paymentTerms: '',
      deliveryDate: '',
      remark: '',
      poNo: '',
      products: [{
        srNo: 1,
        productName: '',
        unit: '',
        gradeValue: '',
        basicRate: 0,
        length: 0,
        width: 0,
        thickness: 0,
        spUnit: 0,
        quantity: 0,
        bundle: 0,
        basicAmount: 0,
        cgstAmt: 0,
        sgstAmt: 0
      }],
      totalQuantity: 0,
      totalAmount: 0,
      totalWeight: 0,
      totalMM: 0,
      orderStatus: '',
      cgst: 0,
      sgst: 0,
      igst: 0,
      tcs: '',
      finalTotal: 0
    });
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAddNewTab = () => (
    <div className="card">
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="orderNo">Order No</label>
            <input
              type="text"
              id="orderNo"
              name="orderNo"
              className="form-control"
              value={formData.orderNo}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderDate">Order Date *</label>
            <input
              type="date"
              id="orderDate"
              name="orderDate"
              className="form-control"
              value={formData.orderDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <div className="form-control" style={{ background: '#f5f5f5' }}>
              {billingAddress ? `${billingAddress.addressLine1}, ${billingAddress.city?.cityName || billingAddress.city}` : 'No address found'}
            </div>
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <div className="form-control" style={{ background: '#f5f5f5' }}>
              {deliveryAddress ? `${deliveryAddress.addressLine1}, ${deliveryAddress.city?.cityName || deliveryAddress.city}` : 'No address found'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paymentTerms">Payment Terms</label>
            <textarea
              id="paymentTerms"
              name="paymentTerms"
              className="form-control"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date *</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              className="form-control"
              value={formData.deliveryDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="poNo">PO No</label>
            <input
              type="text"
              id="poNo"
              name="poNo"
              className="form-control"
              value={formData.poNo}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="remark">Remark</label>
            <textarea
              id="remark"
              name="remark"
              className="form-control"
              value={formData.remark}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <h3>Product Detail</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Product Name *</th>
                  <th>Unit *</th>
                  <th>Grade Value</th>
                  <th>Basic Rate *</th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>Thickness</th>
                  <th>S P/Unit</th>
                  <th>Quantity *</th>
                  <th>Bundle</th>
                  <th>Basic Amount</th>
                  <th>CGST Amt.</th>
                  <th>SGST Amt.</th>
                </tr>
              </thead>
              <tbody>
                {formData.products.map((product, index) => (
                  <tr key={index}>
                    <td>{product.srNo}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={product.productName}
                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={product.unit}
                        onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={product.gradeValue}
                        onChange={(e) => handleProductChange(index, 'gradeValue', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.basicRate}
                        onChange={(e) => handleProductChange(index, 'basicRate', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.length}
                        onChange={(e) => handleProductChange(index, 'length', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.width}
                        onChange={(e) => handleProductChange(index, 'width', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.thickness}
                        onChange={(e) => handleProductChange(index, 'thickness', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.spUnit}
                        onChange={(e) => handleProductChange(index, 'spUnit', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.bundle}
                        onChange={(e) => handleProductChange(index, 'bundle', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.basicAmount}
                        onChange={(e) => handleProductChange(index, 'basicAmount', e.target.value)}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.cgstAmt}
                        onChange={(e) => handleProductChange(index, 'cgstAmt', e.target.value)}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={product.sgstAmt}
                        onChange={(e) => handleProductChange(index, 'sgstAmt', e.target.value)}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-secondary" onClick={addProduct}>
            Add Product
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="totalQuantity">Total Quantity *</label>
            <input
              type="number"
              id="totalQuantity"
              name="totalQuantity"
              className="form-control"
              value={formData.totalQuantity}
              onChange={handleInputChange}
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalAmount">Total Amount *</label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              className="form-control"
              value={formData.totalAmount}
              onChange={handleInputChange}
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalWeight">Total Weight</label>
            <input
              type="number"
              id="totalWeight"
              name="totalWeight"
              className="form-control"
              value={formData.totalWeight}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalMM">Total MM</label>
            <input
              type="number"
              id="totalMM"
              name="totalMM"
              className="form-control"
              value={formData.totalMM}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderStatus">Order Status *</label>
            <select
              id="orderStatus"
              name="orderStatus"
              className="form-control"
              value={formData.orderStatus}
              onChange={handleInputChange}
              required
            >
              <option value="">- Select -</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cgst">CGST</label>
            <input
              type="number"
              id="cgst"
              name="cgst"
              className="form-control"
              value={formData.cgst}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="sgst">SGST</label>
            <input
              type="number"
              id="sgst"
              name="sgst"
              className="form-control"
              value={formData.sgst}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="igst">IGST</label>
            <input
              type="number"
              id="igst"
              name="igst"
              className="form-control"
              value={formData.igst}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="tcs">TCS</label>
            <select
              id="tcs"
              name="tcs"
              className="form-control"
              value={formData.tcs}
              onChange={handleInputChange}
            >
              <option value="">- Select -</option>
              {/* Add TCS options here */}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="finalTotal">Final Total *</label>
            <input
              type="number"
              id="finalTotal"
              name="finalTotal"
              className="form-control"
              value={formData.finalTotal}
              onChange={handleInputChange}
              required
              readOnly
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <FaSave /> Save
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            <MdRefresh /> Reset
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
            <FaTimes /> Close
          </button>
        </div>
      </form>
    </div>
  );

  const renderListTab = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Orders List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search orders..."
            className="form-control search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center text-danger">{error}</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber || ''}</td>
                  <td>{order.customerName || ''}</td>
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                  <td>{order.orderStatus || ''}</td>
                  <td>{/* PDF actions will go here */}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(order)} title="Edit"><FaEdit /></button>
                    <button className="btn-icon" onClick={() => handleDelete(order._id)} title="Delete"><FaTrash /></button>
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
    <div className="page-container">
      <div className="page-header">
        <h1><FaClipboardCheck /> Order Approval</h1>
      </div>

      <div className="page-content">
        <div className="tabs">
          <button
            className={`tab-button${activeTab === 'list' ? ' active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            List
          </button>
          <button
            className={`tab-button${activeTab === 'add-new' ? ' active' : ''}`}
            onClick={() => setActiveTab('add-new')}
          >
            Add New
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tab-content">
          {activeTab === 'list' && renderListTab()}
          {activeTab === 'add-new' && renderAddNewTab()}
        </div>
      </div>
    </div>
  );
};

export default OrderApproval; 