import React, { useState, useEffect, useRef } from 'react';
import '../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaQrcode, FaTrash, FaEdit } from 'react-icons/fa';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const itemsPerPage = 10;

  const [searchFields, setSearchFields] = useState({
    productName: '',
    length: '',
    width: '',
    grade: '',
    quantity: ''
  });
  const [productOptions, setProductOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Fetch assignments when component mounts (removed fetchCustomers)
  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    // Fetch product and grade options for the search tab
    axios.get('http://localhost:5000/api/products/')
      .then(res => setProductOptions(res.data))
      .catch(() => setProductOptions([]));
    axios.get('http://localhost:5000/api/grades/')
      .then(res => setGradeOptions(res.data))
      .catch(() => setGradeOptions([]));
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

  const handleEditAssignment = (assignment) => {
    // Convert date to yyyy-MM-dd format for HTML date input
    const formattedDate = assignment.date ? new Date(assignment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    setFormData({
      date: formattedDate,
      customerName: assignment.customerName || '',
      orderId: assignment.orderId || '',
      labelNumber: assignment.labelNumber || '',
      qrCode: assignment.qrCode || '',
      assignTo: assignment.assignTo || '',
      labelDetails: assignment.labelDetails || {
        productName: '', unit: '', grade: '', length: '', width: '', thickness: '', totalMm: '', quantity: '', bundleNumber: ''
      },
      marketplace: assignment.marketplace || '',
    });
    setEditingId(assignment._id);
    setActiveTab('add');
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await axios.post(`${API_URL}/assignments/update/${editingId}`, formData);
        toast.success('Assignment updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/assignments`, formData);
        toast.success('Assignment created successfully!');
      }
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerName: '', orderId: '', labelNumber: '', qrCode: '', assignTo: '',
        labelDetails: { productName: '', unit: '', grade: '', length: '', width: '', thickness: '', totalMm: '', quantity: '', bundleNumber: '' },
        marketplace: '',
      });
      fetchAssignments();
      setActiveTab('list');
    } catch (error) {
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

  const handleSearchFieldChange = (e) => {
    const { name, value } = e.target;
    setSearchFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const params = {
        productName: searchFields.productName,
        length: searchFields.length,
        width: searchFields.width,
        grade: searchFields.grade,
        quantity: searchFields.quantity
      };
      const response = await axios.get('http://localhost:5000/api/assignments/assign-inventory-search', { params });
      setSearchResults(response.data.results);
      if (searchFields.quantity && response.data.results.length < Number(searchFields.quantity)) {
        window.alert(`Only ${response.data.results.length} quantity available in stock.`);
      }
    } catch (err) {
      setSearchError('Error fetching search results. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add this function to handle assign button click
  const handleAssign = (row) => {
    setActiveTab('add');
    setFormData(prev => ({
      ...prev,
      labelNumber: row.mucNumber,
      qrCode: row.mucNumber,
      labelDetails: {
        ...prev.labelDetails,
        productName: row.productName,
        grade: row.grade,
        length: row.length,
        width: row.width,
        unit: row.unit || '',
        bundleNumber: row.bundleNumber || '',
        quantity: row.quantity || '',
        thickness: row.thickness || '',
        totalMm: row.totalMm || ''
      }
    }));
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Update Assignment' : 'Add New Assignment'}</h2>
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
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          handleLabelNumberChange(e);
                        }
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeUpload}
                      style={{ display: 'none' }}
                      id="qrCodeUpload"
                    />
                    <label htmlFor="qrCodeUpload" className="btn-primary" style={{ color: 'white' }}>
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
          <button type="submit" className="btn btn-primary">
            <FaSave /> {editingId ? 'Update Assignment' : 'Save Assignment'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => {
            setActiveTab('list');
            setEditingId(null);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              customerName: '', orderId: '', labelNumber: '', qrCode: '', assignTo: '',
              labelDetails: { productName: '', unit: '', grade: '', length: '', width: '', thickness: '', totalMm: '', quantity: '', bundleNumber: '' },
              marketplace: '',
            });
          }}><FaTimes /> Cancel</button>
        </div>
      </form>
    </div>
  );

  const renderList = () => {
    const totalPages = Math.ceil(assignments.length / itemsPerPage);
    const paginatedAssignments = assignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
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
                {paginatedAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="16" style={{ textAlign: 'center' }}>No assignments found.</td>
                  </tr>
                ) : (
                  paginatedAssignments.map(assignment => (
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
                        <button onClick={() => handleEditAssignment(assignment)} className="btn-icon" title="Edit"><FaEdit /></button>
                        <button onClick={() => handleDeleteAssignment(assignment._id)} className="btn-icon" title="Delete"><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Assign Inventory</h2>
        <p className="page-description">Assign inventory to customers</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span>Search</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <FaPlusCircle className="btn-icon" /> <span>Add New</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FaList className="btn-icon" /> <span>List</span>
        </button>
      </div>

      {activeTab === 'search' ? (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="card" style={{ width: '80%', minWidth: 400, maxWidth: 900 }}>
            <h2>Search</h2>
            <form className="form" onSubmit={handleSearch} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Product Name</label>
                  <select name="productName" value={searchFields.productName} onChange={handleSearchFieldChange} className="form-control">
                    <option value="">Select Product</option>
                    {productOptions.map(p => (
                      <option key={p._id} value={p.productName}>{p.productName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Length</label>
                  <input type="text" name="length" value={searchFields.length} onChange={handleSearchFieldChange} className="form-control" placeholder="Enter Length" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Width</label>
                  <input type="text" name="width" value={searchFields.width} onChange={handleSearchFieldChange} className="form-control" placeholder="Enter Width" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Grade</label>
                  <select name="grade" value={searchFields.grade} onChange={handleSearchFieldChange} className="form-control">
                    <option value="">Select Grade</option>
                    {gradeOptions.map(g => (
                      <option key={g._id} value={g.gradeName}>{g.gradeName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={searchFields.quantity} onChange={handleSearchFieldChange} className="form-control" placeholder="Enter Quantity" min="1" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: 200, alignSelf: 'center' }}>Search</button>
            </form>
            {/* Results Table */}
            <div style={{ marginTop: 32 }}>
              {searchLoading && <p>Loading results...</p>}
              {searchError && <p className="error-message">{searchError}</p>}
              {!searchLoading && !searchError && searchResults.length > 0 && (
                <div className="data-table-container">
                  <h3>Search Results</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>MUC Number</th>
                        <th>Product Name</th>
                        <th>Grade</th>
                        <th>Length</th>
                        <th>Width</th>
                        {/* Add more columns as needed */}
                        <th>Assign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.mucNumber}</td>
                          <td>{item.productName}</td>
                          <td>{item.grade}</td>
                          <td>{item.length}</td>
                          <td>{item.width}</td>
                          <td>
                            <button className="btn btn-primary" style={{padding: '4px 12px'}} onClick={() => handleAssign(item)}>
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!searchLoading && !searchError && searchResults.length === 0 && (
                <p>No matching products found. Please adjust your criteria and try again.</p>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default AssignInventory; 