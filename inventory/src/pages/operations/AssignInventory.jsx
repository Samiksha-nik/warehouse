import React, { useState, useEffect } from 'react';
import '../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaQrcode, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const AssignInventory = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [customers, setCustomers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    orderId: '',
    locationStock: '',
    labelNumber: '',
    qrCode: '',
    assignTo: '',
    labelDetails: {
      productName: '',
      unit: '',
      grade: '',
      length: '',
      width: '',
      thickness: '',
      totalMm: '',
      quantity: '',
      bundleNumber: ''
    },
    marketplace: '',
  });

  // Fetch customers and assignments when component mounts
  useEffect(() => {
    fetchCustomers();
    fetchAssignments();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Error fetching customers: ' + error.message);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/assignments');
      setAssignments(response.data);
      setError(null);
    } catch (error) {
      setError('Error fetching assignments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('labelDetails.')) {
      const labelField = name.split('.')[1];
      setFormData(prevState => ({
        ...prevState,
        labelDetails: {
          ...prevState.labelDetails,
          [labelField]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleLabelNumberChange = async (e) => {
    const value = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      qrCode: value,
      labelNumber: value
    }));
    // If the value is 4 digits, try to fetch label details
    if (/^\d{4}$/.test(value)) {
      try {
        const response = await fetch(`http://localhost:5000/api/labels/${value}`);
        if (!response.ok) throw new Error('Label not found');
        const label = await response.json();
        setFormData(prevState => ({
          ...prevState,
          labelDetails: {
            productName: label.productName || '',
            unit: label.unit || '',
            grade: label.gradeValue || '',
            length: label.length || '',
            width: label.width || '',
            thickness: label.thickness || '',
            totalMm: label.totalMM || '',
            quantity: label.quantity || '',
            bundleNumber: label.bundleNumber || ''
          }
        }));
      } catch (err) {
        // Optionally clear label details if not found
        setFormData(prevState => ({
          ...prevState,
          labelDetails: {
            productName: '',
            unit: '',
            grade: '',
            length: '',
            width: '',
            thickness: '',
            totalMm: '',
            quantity: '',
            bundleNumber: ''
          }
        }));
      }
    }
  };

  const handleQRCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('qrCode', file);

        console.log('Uploading QR code file:', file.name);

        const response = await fetch('http://localhost:5000/api/labels/scan', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to process QR code');
        }

        const data = await response.json();
        console.log('QR code data received:', data);

        if (data && data.labelDetails) {
          setFormData(prevState => ({
            ...prevState,
            qrCode: data.qrCode || '',
            labelNumber: data.qrCode || '',
            labelDetails: {
              productName: data.labelDetails.productName || '',
              unit: data.labelDetails.unit || '',
              grade: data.labelDetails.grade || '',
              length: data.labelDetails.length || '',
              width: data.labelDetails.width || '',
              thickness: data.labelDetails.thickness || '',
              totalMm: data.labelDetails.totalMm || '',
              quantity: data.labelDetails.quantity || '',
              bundleNumber: data.labelDetails.bundleNumber || ''
            }
          }));
        } else {
          throw new Error('Invalid QR code data format');
        }
      } catch (error) {
        console.error('Error processing QR code:', error);
        alert(`Error processing QR code: ${error.message}`);
      }
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.orderId || !formData.date || !formData.customerName || !formData.assignTo || !formData.marketplace) {
        alert('Please fill in all required fields (Order ID, Date, Customer Name, Assign To, and Marketplace).');
        return;
      }

      // Prepare the data for submission
      const assignmentData = {
        date: formData.date,
        customerName: formData.customerName,
        orderId: formData.orderId.trim(),
        locationStock: formData.locationStock,
        labelNumber: formData.labelNumber,
        qrCode: formData.qrCode,
        assignTo: formData.assignTo,
        labelDetails: formData.labelDetails,
        marketplace: formData.marketplace
      };

      // Make the API call
      const response = await axios.post('http://localhost:5000/api/assignments', assignmentData);

      if (response.data) {
        alert('Inventory assigned successfully!');
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customerName: '',
          orderId: '',
          locationStock: '',
          labelNumber: '',
          qrCode: '',
          assignTo: '',
          labelDetails: {
            productName: '',
            unit: '',
            grade: '',
            length: '',
            width: '',
            thickness: '',
            totalMm: '',
            quantity: '',
            bundleNumber: ''
          },
          marketplace: ''
        });
        // Refresh assignments list
        fetchAssignments();
        setActiveTab('list');
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      let errorMessage = 'Error saving assignment';
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data || 'Server error occurred';
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/assignments/${id}`);
        alert('Assignment deleted successfully!');
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert(`Error deleting assignment: ${error.message}`);
      }
    }
  };

  // Update the customer selection handler
  const handleCustomerChange = async (e) => {
    const selectedCustomerName = e.target.value;
    setFormData(prev => ({
      ...prev,
      customerName: selectedCustomerName
    }));

    try {
      // Find the selected customer from the customers list
      const selectedCustomer = customers.find(c => c.customerName === selectedCustomerName);
      
      if (selectedCustomer) {
        // Update form with customer details
        setFormData(prev => ({
          ...prev,
          customerCode: selectedCustomer.customerCode || '',
          customerAddress: selectedCustomer.billingAddress ? 
            `${selectedCustomer.billingAddress.addressLine1 || ''} ${selectedCustomer.billingAddress.addressLine2 || ''} ${selectedCustomer.billingAddress.city || ''} ${selectedCustomer.billingAddress.state || ''} ${selectedCustomer.billingAddress.pincode || ''}` : '',
          customerPhone: selectedCustomer.phoneNumber || '',
          customerEmail: selectedCustomer.email || '',
          customerGstin: selectedCustomer.gstin || '',
          customerPan: selectedCustomer.pan || '',
          customerTan: selectedCustomer.tan || '',
          customerBankName: selectedCustomer.bankName || '',
          customerBranchName: selectedCustomer.branchName || '',
          customerAccountNumber: selectedCustomer.accountNumber || '',
          customerIfscCode: selectedCustomer.ifscCode || '',
          customerRemarks: selectedCustomer.remarks || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      alert('Error fetching customer details. Please try again.');
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <form onSubmit={handleSaveAssignment} className="form-container">
        {/* Container for side-by-side blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {/* Order Details Block */}
          <div className="card">
            <div className="card-header">Order Details</div>
            <div className="form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="orderId">Order ID*</label>
                  <input
                    type="text"
                    id="orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    placeholder="Enter order ID"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date*</label>
                  <input
                    type="text"
                    id="date"
                    name="date"
                    value={formData.date}
                    readOnly
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerName">Customer Name*</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assignTo">Assign To*</label>
                  <input
                    type="text"
                    id="assignTo"
                    name="assignTo"
                    value={formData.assignTo}
                    onChange={handleInputChange}
                    placeholder="Enter assign to"
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Marketplace*</label>
                  <div className="marketplace-buttons">
                    <button
                      type="button"
                      className={`marketplace-button ${formData.marketplace === 'Amazon' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, marketplace: 'Amazon' }))}
                    >
                      Amazon
                    </button>
                    <button
                      type="button"
                      className={`marketplace-button ${formData.marketplace === 'Flipkart' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, marketplace: 'Flipkart' }))}
                    >
                      Flipkart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Label Details Block */}
          <div className="card">
            <div className="card-header">Label Details</div>
            <div className="form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="qrCode">QR Code / Label Number*</label>
                  <div className="qr-code-upload">
                    <input
                      type="text"
                      id="qrCode"
                      name="qrCode"
                      value={formData.qrCode}
                      onChange={handleLabelNumberChange}
                      placeholder="Enter QR code or upload image"
                      required
                      className="form-control"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeUpload}
                      style={{ display: 'none' }}
                      id="qrCodeUpload"
                    />
                    <label htmlFor="qrCodeUpload" className="btn-primary">
                      Upload QR Code
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={formData.labelDetails.productName}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={formData.labelDetails.unit}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Grade</label>
                  <input
                    type="text"
                    value={formData.labelDetails.grade}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Length</label>
                  <input
                    type="text"
                    value={formData.labelDetails.length}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Width</label>
                  <input
                    type="text"
                    value={formData.labelDetails.width}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Thickness</label>
                  <input
                    type="text"
                    value={formData.labelDetails.thickness}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Total MM</label>
                  <input
                    type="text"
                    value={formData.labelDetails.totalMm}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="text"
                    value={formData.labelDetails.quantity}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Bundle Number</label>
                  <input
                    type="text"
                    value={formData.labelDetails.bundleNumber}
                    className="form-control"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> Save Assignment
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Assignments List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search assignments..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : assignments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Order ID</th>
                <th>Label Number</th>
                <th>QR Code</th>
                <th>Assign To</th>
                <th>Marketplace</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{new Date(assignment.date).toLocaleDateString()}</td>
                  <td>{assignment.customerName}</td>
                  <td>{assignment.orderId}</td>
                  <td>{assignment.labelNumber}</td>
                  <td>{assignment.qrCode}</td>
                  <td>{assignment.assignTo}</td>
                  <td>
                    <span className={`marketplace-badge ${assignment.marketplace?.toLowerCase()}`}>
                      {assignment.marketplace}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteAssignment(assignment._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No assignments found</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Assign Inventory</h2>
        <p className="page-description">Assign inventory to customers</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <FaPlusCircle className="btn-icon" /> Add New
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FaList className="btn-icon" /> List
        </button>
      </div>

      {activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default AssignInventory; 