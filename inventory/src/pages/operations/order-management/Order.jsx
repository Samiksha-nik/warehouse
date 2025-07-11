import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../../component/OrderPDF';

function mapOrderToPDF(order) {
  return {
    company: {
      name: "BOUJEE BALANCEE PRIVATE LIMITED",
      address: "Plot no 162, Gala no 4 Gunthas Shirishpada to khanavali Road, Vad Palghar",
      cin: "U31500MH2024PTC423272",
      gstin: "27AAMCB9576J1ZT",
      pan: "AAMCB9575G",
      logoUrl: "/logo.png",
      corporateAddress: "20 FL COMMERZ 2 CTS 95 48 3, 4 590 OBROI GARDEN CITY,GOREGAON EAST MUMBAI-400063.MH"
    },
    billedTo: {
      name: order.customerName,
      address: [order.billingAddress?.addressLine1, order.billingAddress?.addressLine2, order.billingAddress?.addressLine3].filter(Boolean).join(", "),
      gstin: order.billingAddress?.gstin || '',
      pan: order.billingAddress?.pan || '',
      stateName: order.billingAddress?.state?.stateName || order.billingAddress?.state || ''
    },
    shippedTo: {
      name: order.customerName,
      address: [order.deliveryAddress?.addressLine1, order.deliveryAddress?.addressLine2, order.deliveryAddress?.addressLine3].filter(Boolean).join(", "),
      gstin: order.deliveryAddress?.gstin || '',
      pan: order.deliveryAddress?.pan || '',
      stateName: order.deliveryAddress?.state?.stateName || order.deliveryAddress?.state || ''
    },
    products: (order.products || []).map((prod, idx) => ({
      description: prod.productName || '',
      subDescription: prod.remark || '',
      hsn: prod.hsnCode || '',
      grade: prod.gradeValue || '',
      length: prod.length || '',
      width: prod.width || '',
      thickness: prod.thickness || '',
      qty: prod.quantity || '',
      basic: prod.basicRate || '',
      taxableValue: prod.amount || ''
    })),
    totals: {
      taxableValue: order.totalTaxableValue || '',
      cgst: order.cgst || '',
      sgst: order.sgst || '',
      igst: order.igst || '',
      totalGst: order.totalGst || '',
      tcsRate: order.tcsRate || '',
      tcs: order.tcs || '',
      invoiceTotal: order.invoiceTotal || ''
    },
    bank: {
      name: "AXIS BANK LTD",
      beneficiary: "Boujee Balancee Private Limited",
      accountNo: "942000005487120",
      ifsc: "UTIB0000162",
      branch: "GOREGAON EAST"
    },
    orderNo: order.orderNumber || '',
    deliveryDate: order.deliveryDate || '',
    date: order.orderDate || ''
  };
}

const Order = () => {
  const [activeTab, setActiveTab] = useState('order');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || '';
  const orderUserId = userRole === 'developer' ? 2 : 1;
  const TCSper = 0.1;
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
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [categoryLinks, setCategoryLinks] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Auth headers:', headers); // Debug log
    return headers;
  };

  const fetchOrders = async () => {
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

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers/', { headers: getAuthHeaders() });
      setCustomers(response.data);
    } catch (err) {
      setCustomers([]);
    }
  };

  // Fetch addresses for selected customer
  useEffect(() => {
    if (formData.customerName) {
      fetchAddressesForCustomer(formData.customerName);
    } else {
      setAddresses([]);
    }
  }, [formData.customerName]);

  const fetchAddressesForCustomer = async (customerName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/addresses/`, { headers: getAuthHeaders() });
      // Filter addresses by customerName
      const filtered = response.data.filter(addr => addr.customerName === customerName);
      setAddresses(filtered);
    } catch (err) {
      setAddresses([]);
    }
  };

  // Fetch categoryLinks for selected customer
  useEffect(() => {
    if (formData.customerName) {
      fetchCategoryLinksForCustomer(formData.customerName);
    } else {
      setCategoryLinks([]);
    }
  }, [formData.customerName]);

  const fetchCategoryLinksForCustomer = async (customerName) => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers/', { headers: getAuthHeaders() });
      const customer = response.data.find(cust => cust.customerName === customerName);
      setCategoryLinks(customer?.categoryLinks || []);
    } catch (err) {
      setCategoryLinks([]);
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
    // Auto-calculate totalMM if length, width, or thickness changes
    const { length, width, thickness, basicRate, quantity } = updatedProducts[index];
    const l = field === 'length' ? Number(value) : Number(length) || 0;
    const w = field === 'width' ? Number(value) : Number(width) || 0;
    const t = field === 'thickness' ? Number(value) : Number(thickness) || 0;
    updatedProducts[index].totalMM = l * w * t;

    // Auto-fill unit, gradeValue, and basicRate if productName changes
    if (field === 'productName') {
      const link = categoryLinks.find(link => (link.product || '').toLowerCase() === value.toLowerCase());
      updatedProducts[index].unit = link?.unit || '';
      updatedProducts[index].gradeValue = link?.grade || '';
      updatedProducts[index].basicRate = link?.basicRate ? Number(link.basicRate) : 0;
    }

    // Auto-calculate sellingPrice and amount if basicRate or quantity changes
    const br = Number(updatedProducts[index].basicRate) || 0;
    const qty = field === 'quantity' ? Number(value) : Number(quantity) || 0;
    updatedProducts[index].sellingPrice = br * qty;
    updatedProducts[index].amount = br * qty;

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
      const orderPayload = {
        ...formData,
        orderUserId, // always send
        orderNumber: formData.orderNumber || '', // send empty string if not present
        TCSper
      };
      if (editId) {
        await axios.put(`http://localhost:5000/api/orders/${editId}`, orderPayload, { headers: getAuthHeaders() });
        toast.success('Order updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/orders', orderPayload, { headers: getAuthHeaders() });
        toast.success('Order saved successfully!');
      }
      fetchOrders();
      resetForm();
      setError(null);
    } catch (err) {
      setError(editId ? 'Failed to update order' : 'Failed to create order');
      toast.error(editId ? 'Failed to update order' : 'Failed to create order');
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
        await axios.delete(`http://localhost:5000/api/orders/${id}`, { headers: getAuthHeaders() });
        toast.success('Order deleted successfully!');
        fetchOrders();
      } catch (err) {
        toast.error('Failed to delete order');
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

  // Display values from the first row of products
  const firstProduct = formData.products[0] || {};
  const totalQuantity = firstProduct.quantity || 0;
  const totalWeight = firstProduct.weight || 0;
  const totalMM = firstProduct.totalMM || 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Order</h2>
        <p className="page-description">Manage orders</p>
      </div>

      <div className="page-content">
        {/* Developer-only box above Product Details */}
        {userRole === 'developer' && (
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px',
            background: '#f9f9f9'
          }}>
            <div><strong>Order Number:</strong> {formData.orderNumber || '(auto-generated after save)'}</div>
            <div><strong>Order UserId:</strong> {orderUserId}</div>
            <div><strong>TCSper:</strong> {TCSper}</div>
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
                    <Select
                      id="customerName"
                      name="customerName"
                      options={customers.map(cust => ({ value: cust.customerName, label: cust.customerName }))}
                      value={customers.map(cust => ({ value: cust.customerName, label: cust.customerName })).find(opt => opt.value === formData.customerName) || null}
                      onChange={selected => setFormData(prev => ({
                        ...prev,
                        customerName: selected ? selected.value : ''
                      }))}
                      placeholder="Search or select customer..."
                      isClearable
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

                  {/* Billing Address Dropdown */}
                  <div className="form-group">
                    <label htmlFor="billingAddress">Billing Address *</label>
                    <select
                      id="billingAddress"
                      name="billingAddress"
                      className="form-control"
                      value={formData.billingAddress?._id || ''}
                      onChange={e => {
                        const selected = addresses.find(addr => addr._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          billingAddress: selected
                        }));
                      }}
                      required
                    >
                      <option value="">Select Billing Address</option>
                      {addresses.map(addr => (
                        <option key={addr._id} value={addr._id}>
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          {addr.addressLine3 ? `, ${addr.addressLine3}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Address Dropdown */}
                  <div className="form-group">
                    <label htmlFor="deliveryAddressId">Delivery Address *</label>
                    <select
                      id="deliveryAddressId"
                      name="deliveryAddressId"
                      className="form-control"
                      value={formData.deliveryAddress?._id || ''}
                      onChange={e => {
                        const selected = addresses.find(addr => addr._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          deliveryAddress: selected
                        }));
                      }}
                      required
                    >
                      <option value="">Select Delivery Address</option>
                      {addresses.map(addr => (
                        <option key={addr._id} value={addr._id}>
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          {addr.addressLine3 ? `, ${addr.addressLine3}` : ''}
                        </option>
                      ))}
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
                              <select
                                className="form-control"
                                value={product.productName || ''}
                                onChange={e => handleProductChange(index, 'productName', e.target.value)}
                                required
                              >
                                <option value="">Select</option>
                                {categoryLinks.map(link => (
                                  <option key={link.product} value={link.product}>{link.product}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={product.unit}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={product.gradeValue}
                                readOnly
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
                                readOnly
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
                                onChange={(e) => handleProductChange(index, 'basicRate', e.target.value)}
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
                      value={totalQuantity}
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
                      value={totalWeight}
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
                      value={totalMM}
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
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No orders found</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNumber || ''}</td>
                          <td>{order.customerName || ''}</td>
                          <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                          <td>
                            <span className={`status-badge ${(order.orderStatus || '').toLowerCase()}`}>
                              {order.orderStatus || ''}
                            </span>
                          </td>
                          <td>
                            <PDFDownloadLink
                              document={<OrderPDF order={mapOrderToPDF(order)} userName={order.customerName || ''} />}
                              fileName={`SalesPerforma_${order.orderNumber || order._id}.pdf`}
                              style={{ textDecoration: 'none' }}
                            >
                              {({ loading }) => (
                                <button className="btn-icon" title="Sales Performa PDF">
                                  <FaFilePdf style={{ color: '#d32f2f', marginRight: 4 }} />
                                  {loading ? 'Generating...' : 'Sales Performa'}
                                </button>
                              )}
                            </PDFDownloadLink>
                          </td>
                          <td className="action-buttons">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Order; 