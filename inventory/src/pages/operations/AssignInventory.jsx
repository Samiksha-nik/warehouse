import React, { useState, useEffect, useRef } from 'react';
import '../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaQrcode, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import tableStyles from '../../styles/TableStyles.module.css';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const AssignInventory = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    orderId: '',
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

  const lastCheckedLabel = useRef('');

  // Fetch assignments when component mounts (removed fetchCustomers)
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/assignments`);
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
    const value = e.target.value.trim();

    // If the value is empty or same as last checked, do nothing
    if (!value || value === lastCheckedLabel.current) {
      // Clear labelDetails if MUC is cleared
      if (!value) {
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
          },
          orderId: '' // Also clear orderId if MUC is cleared
        }));
      }
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      qrCode: value,
      labelNumber: value
    }));

    // Only check if the value is at least 5 characters (or your desired length)
    if (value.length < 5) return;

    try {
      // First, fetch the full label details from the labels collection
      const labelResponse = await axios.get(`${API_URL}/labels?mucNumber=${value}`);
      const matchingLabel = labelResponse.data[0]; // Assuming API returns an array, take the first match

      if (!matchingLabel) {
        toast.error('This MUC number is not found in the Labels list. Please create it first.');
        lastCheckedLabel.current = value;
        setFormData(prevState => ({
          ...prevState,
          labelNumber: '',
          qrCode: '',
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
          orderId: ''
        }));
        return;
      } else {
        // Reset lastCheckedLabel if a valid value is entered
        lastCheckedLabel.current = '';
        // Populate labelDetails from the fetched label data, ensuring correct casing for totalMm
        setFormData(prevState => ({
          ...prevState,
          labelDetails: {
            productName: matchingLabel.productName || '',
            unit: matchingLabel.unit || '',
            grade: matchingLabel.gradeValue || '', // Correctly maps gradeValue from Label to grade in Assignment
            length: matchingLabel.length || '',
            width: matchingLabel.width || '',
            thickness: matchingLabel.thickness || '',
            totalMm: matchingLabel.totalMM || '', // Corrected: Maps totalMM (from Label) to totalMm (in Assignment)
            quantity: matchingLabel.quantity || '',
            bundleNumber: matchingLabel.bundleNumber || ''
          },
          // orderId is entered by user, not fetched from labels here
        }));
      }

      // After fetching label details, check for duplicates in assignments
      const checkDuplicateResponse = await axios.get(`${API_URL}/assignments?labelNumber=${value}`);
      if (checkDuplicateResponse.data && checkDuplicateResponse.data.length > 0) {
        const isExactMatch = checkDuplicateResponse.data.some(
          assignment => assignment.labelNumber === value
        );
        
        if (isExactMatch) {
          toast.error('This MUC number is already assigned. Please use a different MUC number.');
          setFormData(prevState => ({
            ...prevState,
            labelNumber: '',
            qrCode: '',
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
            orderId: ''
          }));
          return;
        }
      }

    } catch (err) {
      console.error('Error checking MUC number:', err);
      toast.error('Error checking MUC number. Please try again.');
      setFormData(prevState => ({
        ...prevState,
        labelNumber: '',
        qrCode: '',
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
        orderId: ''
      }));
    }
  };

  const handleQRCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formDataObj = new FormData();
        formDataObj.append('barcode', file);
        formDataObj.append('mucNumber', formData.labelNumber); // Use the state variable

        console.log('Uploading barcode file:', file.name);

        const response = await fetch(`${API_URL}/labels/scan-barcode`, {
          method: 'POST',
          body: formDataObj
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to process barcode');
        }

        const data = await response.json();
        console.log('Barcode data received:', data);

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
          toast.error('No label details found in barcode');
        }
      } catch (err) {
        console.error('Error scanning barcode:', err);
        toast.error('Error scanning barcode: ' + err.message);
      }
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();

    // Basic validation
    console.log('Validating form data:', formData);
    console.log('customerName:', formData.customerName);
    console.log('orderId:', formData.orderId);
    console.log('labelNumber:', formData.labelNumber);
    console.log('assignTo:', formData.assignTo);
    console.log('marketplace:', formData.marketplace);

    if (!formData.customerName || !formData.orderId || !formData.labelNumber || !formData.assignTo || !formData.marketplace) {
      toast.error('Please fill all required fields.');
      return;
    }

    // Validate labelDetails (ensure product details are fetched)
    console.log('Validating labelDetails:', formData.labelDetails);
    if (!formData.labelDetails.productName || !formData.labelDetails.unit || !formData.labelDetails.grade || !formData.labelDetails.length || !formData.labelDetails.width || !formData.labelDetails.thickness || !formData.labelDetails.totalMm || !formData.labelDetails.quantity) {
      toast.error('Please ensure product details are fetched by entering a valid MUC number.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/assignments`, formData);
      toast.success('Assignment created successfully!');
      // Clear form after successful submission
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        orderId: '',
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
      fetchAssignments(); // Refresh assignments list
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Error saving assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`${API_URL}/assignments/${id}`);
        toast.success('Assignment deleted successfully!');
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error(`Error deleting assignment: ${error.message}`);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <form onSubmit={handleSaveAssignment} className="form-container">
        {/* Container for side-by-side blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            maxWidth: '100%',
            overflowX: 'auto'
          }}
        >
          {/* Order Details Block */}
          <div className="card">
            <div className="card-header">Order Details</div>
            <div className="form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customerName">Assigned From*</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter assigned from"
                    required
                  />
                </div>
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
                  <label htmlFor="labelNumber">MUC Number / QR Code*</label>
                  <div className="qr-code-upload">
                    <input
                      type="text"
                      id="labelNumber"
                      name="labelNumber"
                      value={formData.labelNumber}
                      onChange={handleLabelNumberChange}
                      placeholder="Enter MUC or Scan QR"
                      required
                      className="form-control"
                      maxLength={20}
                      onBlur={handleLabelNumberChange}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeUpload}
                      style={{ display: 'none' }}
                      id="qrCodeUpload"
                    />
                    <label htmlFor="qrCodeUpload" className="btn-primary">
                      Upload Barcode
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={formData.labelDetails.productName}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={formData.labelDetails.unit}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Grade</label>
                  <input
                    type="text"
                    value={formData.labelDetails.grade}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Length</label>
                  <input
                    type="text"
                    value={formData.labelDetails.length}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Width</label>
                  <input
                    type="text"
                    value={formData.labelDetails.width}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Thickness</label>
                  <input
                    type="text"
                    value={formData.labelDetails.thickness}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Total MM</label>
                  <input
                    type="text"
                    value={formData.labelDetails.totalMm}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="text"
                    value={formData.labelDetails.quantity}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Bundle Number</label>
                  <input
                    type="text"
                    value={formData.labelDetails.bundleNumber}
                    className="form-control"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary"><FaSave /> Save Assignment</button>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('list')}><FaTimes /> Cancel</button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <h2>Assigned Inventory List</h2>
      {loading ? (
        <p>Loading assignments...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>MUC Number</th>
                <th>Assigned From</th>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Unit</th>
                <th>Grade</th>
                <th>Length</th>
                <th>Width</th>
                <th>Thickness</th>
                <th>Total MM</th>
                <th>Quantity</th>
                <th>Bundle Number</th>
                <th>Assigned To</th>
                <th>Marketplace</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center' }}>No assignments found.</td>
                </tr>
              ) : (
                assignments.map(assignment => (
                  <tr key={assignment._id}>
                    <td>{assignment.date ? new Date(assignment.date).toLocaleDateString() : ''}</td>
                    <td>{assignment.labelNumber}</td>
                    <td>{assignment.customerName}</td>
                    <td>{assignment.orderId}</td>
                    <td className={tableStyles.productNameCell}>{assignment.labelDetails?.productName || '-'}</td>
                    <td>{assignment.labelDetails?.unit || '-'}</td>
                    <td>{assignment.labelDetails?.grade || '-'}</td>
                    <td>{assignment.labelDetails?.length || '-'}</td>
                    <td>{assignment.labelDetails?.width || '-'}</td>
                    <td>{assignment.labelDetails?.thickness || '-'}</td>
                    <td>{assignment.labelDetails?.totalMm || '-'}</td>
                    <td>{assignment.labelDetails?.quantity || '-'}</td>
                    <td>{assignment.labelDetails?.bundleNumber || '-'}</td>
                    <td>{assignment.assignTo}</td>
                    <td>{assignment.marketplace}</td>
                    <td>
                      <button onClick={() => handleDeleteAssignment(assignment._id)} className="btn-icon">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
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