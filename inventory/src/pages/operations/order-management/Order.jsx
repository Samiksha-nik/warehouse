import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import axios from 'axios';

const Order = () => {
  const [activeTab, setActiveTab] = useState('order');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    orderDate: '',
    billingAddress: '',
    deliveryAddressId: '',
    deliveryDate: '',
    poNo: '',
    remark: '',
    orderStatus: 'draft',
    products: [{
      srNo: 1,
      productName: '',
      unit: '',
      gradeValue: '',
      length: 0,
      width: 0,
      thickness: 0,
      quantity: 0,
      bundle: 0,
      bundleLimit: 0,
      weight: 0,
      totalMM: 0,
      id: '',
      remark: '',
      sellingPrice: 0,
      basicRate: 0,
      amount: 0
    }],
    totalQuantity: 0,
    totalWeight: 0,
    totalMM: 0,
    orderNumber: '',
    TCSper: 0.1 // Set default to 0.1
  });

  useEffect(() => {
    fetchOrders();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
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
        length: 0,
        width: 0,
        thickness: 0,
        quantity: 0,
        bundle: 0,
        bundleLimit: 0,
        weight: 0,
        totalMM: 0,
        id: '',
        remark: '',
        sellingPrice: 0,
        basicRate: 0,
        amount: 0
      }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editId) {
        await axios.put(`http://localhost:5000/api/orders/${editId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/orders', formData);
      }
      fetchOrders();
      resetForm();
      setError(null);
    } catch (err) {
      setError(editId ? 'Failed to update order' : 'Failed to create order');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditId(order._id);
    setFormData({
      customerName: order.customerName,
      orderDate: order.orderDate.split('T')[0],
      billingAddress: order.billingAddress,
      deliveryAddressId: order.deliveryAddressId,
      deliveryDate: order.deliveryDate.split('T')[0],
      poNo: order.poNo,
      remark: order.remark,
      orderStatus: order.orderStatus,
      products: order.products,
      totalQuantity: order.totalQuantity,
      totalWeight: order.totalWeight,
      totalMM: order.totalMM,
      orderNumber: order.orderNumber,
      TCSper: order.TCSper
    });
    setActiveTab('order');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`);
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
      }
    }
  };

  const handleProductDelete = (index) => {
    if (formData.products.length > 1) {
      const updatedProducts = formData.products.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        products: updatedProducts.map((p, idx) => ({ ...p, srNo: idx + 1 }))
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      orderDate: '',
      billingAddress: '',
      deliveryAddressId: '',
      deliveryDate: '',
      poNo: '',
      remark: '',
      orderStatus: 'draft',
      products: [{
        srNo: 1,
        productName: '',
        unit: '',
        gradeValue: '',
        length: 0,
        width: 0,
        thickness: 0,
        quantity: 0,
        bundle: 0,
        bundleLimit: 0,
        weight: 0,
        totalMM: 0,
        id: '',
        remark: '',
        sellingPrice: 0,
        basicRate: 0,
        amount: 0
      }],
      totalQuantity: 0,
      totalWeight: 0,
      totalMM: 0,
      orderNumber: '',
      TCSper: 0.1
    });
    setEditId(null);
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Order</h2>
        <p className="page-description">Manage orders</p>
      </div>

      <div className="page-content">
        {/* Developer-only box above Product Details */}
        {user?.role === 'developer' && (
          <div style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            background: '#f9f9f9',
            display: 'flex',
            gap: '24px',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Order Number:</label>
              <input
                type="text"
                className="form-control"
                value={formData.orderNumber || ''}
                readOnly
                style={{ width: 150 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Order UserId:</label>
              <input
                type="text"
                className="form-control"
                value={user?.role === 'admin' ? '1' : user?.role === 'developer' ? '2' : ''}
                readOnly
                style={{ width: 250 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>TCSper:</label>
              <input
                type="number"
                className="form-control"
                value={0.1}
                readOnly
                style={{ width: 100 }}
              />
            </div>
          </div>
        )}
        <button
          className={`tab-button${activeTab === 'order' ? ' active' : ''}`}
          onClick={() => setActiveTab('order')}
        >
          Order
        </button>
        <button
          className={`tab-button${activeTab === 'order-list' ? ' active' : ''}`}
          onClick={() => setActiveTab('order-list')}
        >
          Order List
        </button>

        <div className="tab-content">
          {activeTab === 'order' && (
            <div className="card">
              <form onSubmit={handleSubmit} className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="customerName">Customer Name *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      className="form-control"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
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
                    <label htmlFor="billingAddress">Billing Address *</label>
                    <select
                      id="billingAddress"
                      name="billingAddress"
                      className="form-control"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Billing Address</option>
                      {/* Add billing address options here */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="deliveryAddressId">Delivery Address *</label>
                    <select
                      id="deliveryAddressId"
                      name="deliveryAddressId"
                      className="form-control"
                      value={formData.deliveryAddressId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Delivery Address</option>
                      {/* Add delivery address options here */}
                    </select>
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
                  <h3>Product Details</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Product Name *</th>
                          <th>Unit *</th>
                          <th>Grade Value *</th>
                          <th>Length</th>
                          <th>Width</th>
                          <th>Thickness</th>
                          <th>Quantity *</th>
                          <th>Bundle</th>
                          <th>Bundle Limit</th>
                          <th>Weight</th>
                          <th>Total MM</th>
                          <th>ID</th>
                          <th>Remark</th>
                          <th>Selling Price</th>
                          <th>Basic Rate</th>
                          <th>Amount</th>
                          <th>Actions</th> {/* Add Actions column */}
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
                                value={product.bundleLimit}
                                onChange={(e) => handleProductChange(index, 'bundleLimit', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={product.weight}
                                onChange={(e) => handleProductChange(index, 'weight', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={product.totalMM}
                                onChange={(e) => handleProductChange(index, 'totalMM', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={product.id}
                                onChange={(e) => handleProductChange(index, 'id', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={product.remark}
                                onChange={(e) => handleProductChange(index, 'remark', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={product.sellingPrice}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={product.basicRate}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={product.amount}
                                readOnly
                              />
                            </td>
                            <td>
                              {formData.products.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleProductDelete(index)}
                                  title="Delete Product"
                                >
                                  <FaTrash />
                                </button>
                              )}
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
                    <label htmlFor="totalQuantity">Total Quantity</label>
                    <input
                      type="number"
                      id="totalQuantity"
                      name="totalQuantity"
                      className="form-control"
                      value={formData.totalQuantity}
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
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="orderStatus">Order Status</label>
                    <select
                      id="orderStatus"
                      name="orderStatus"
                      className="form-control"
                      value={formData.orderStatus}
                      onChange={handleInputChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <FaSave /> Save
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
                    <FaTimes /> Close
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'order-list' && (
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
                      <th>Order No.</th>
                      <th>Customer Name</th>
                      <th>Order Date</th>
                      <th>Delivery Date</th>
                      <th>Total Quantity</th>
                      <th>Total Weight</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center">Loading...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="8" className="text-center text-danger">{error}</td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">No orders found</td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNo}</td>
                          <td>{order.customerName}</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                          <td>{order.totalQuantity}</td>
                          <td>{order.totalWeight}</td>
                          <td>
                            <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => handleEdit(order)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDelete(order._id)}
                              title="Delete"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Order; 