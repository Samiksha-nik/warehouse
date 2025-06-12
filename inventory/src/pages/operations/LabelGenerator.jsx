import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/shared.css';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaFilePdf } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LabelPDF from '../../component/LabelPDF';
import QRScanner from '../../component/QRScanner';

const API_URL = 'http://localhost:5000/api';

const LabelGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [grades, setGrades] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchMuc, setSearchMuc] = useState('');
  const [formData, setFormData] = useState({
    mucNumber: '',
    inventoryType: '',
    productName: '',
    unit: '',
    gradeValue: '',
    length: '',
    width: '',
    thickness: '',
    totalMM: 0,
    quantity: '',
    bundleNumber: '',
    remark: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [mucValid, setMucValid] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Fetch products, units, grades, and labels on component mount
  useEffect(() => {
    fetchProducts();
    fetchUnits();
    fetchGrades();
    fetchLabels();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API_URL}/units`);
      setUnits(response.data);
    } catch (err) {
      setError('Error fetching units: ' + err.message);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${API_URL}/grades`);
      setGrades(response.data);
    } catch (err) {
      setError('Error fetching grades: ' + err.message);
    }
  };

  const fetchLabels = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/labels`;
      
      const params = new URLSearchParams();
      
      // Add date range parameters if they exist
      if (dateRange.startDate && dateRange.endDate) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }
      
      // Add MUC number search parameter if it exists
      if (searchMuc) {
        params.append('mucNumber', searchMuc);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching labels with URL:', url);
      const response = await axios.get(url);
      console.log('Received labels:', response.data.length);
      setLabels(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Error fetching labels: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicateMuc = async (mucNumber) => {
    if (!mucNumber) {
      setMucValid(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/labels/check-muc/${mucNumber}`);
      if (response.data.exists) {
        setDialogMessage('This MUC number is already used in a label. Please enter a unique MUC number.');
        setDialogOpen(true);
        setFormData(prev => ({ ...prev, mucNumber: '' }));
        setMucValid(false);
      } else {
        setMucValid(true);
      }
    } catch (err) {
      setDialogMessage('Error checking MUC number.');
      setDialogOpen(true);
      setMucValid(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: value
      };
      
      // Calculate totalMM if any of the dimensions change
      if (name === 'thickness' || name === 'length' || name === 'width') {
        const thickness = parseFloat(newState.thickness) || 0;
        const length = parseFloat(newState.length) || 0;
        const width = parseFloat(newState.width) || 0;
        newState.totalMM = thickness * length * width;
      }
      
      return newState;
    });
    if (name === 'mucNumber') {
      checkDuplicateMuc(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !mucValid) {
      setErrorMessage('Please enter a unique MUC number before submitting.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      console.log('Submitting form data:', formData);

      const formattedData = {
        ...formData,
        totalMM: parseFloat(formData.totalMM) || 0
      };

      console.log('Formatted data:', formattedData);

      const response = await axios.post(`${API_URL}/labels`, formattedData);
      setLabels([...labels, response.data]);
      setFormData({
        mucNumber: '',
        inventoryType: '',
        productName: '',
        unit: '',
        gradeValue: '',
        length: '',
        width: '',
        thickness: '',
        totalMM: 0,
        quantity: '',
        bundleNumber: '',
        remark: ''
      });
      setActiveTab('list');
      setSuccessMessage('Label generated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error details:', error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Error generating label');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      try {
        await axios.delete(`${API_URL}/labels/${id}`);
        alert('Label deleted successfully!');
        fetchLabels();
      } catch (error) {
        alert('Error deleting label: ' + error.message);
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.mucNumber) errors.push('MUC Number is required');
    if (!formData.inventoryType) errors.push('Inventory Type is required');
    if (!formData.productName) errors.push('Product Name is required');
    if (!formData.unit) errors.push('Unit is required');
    if (!formData.gradeValue) errors.push('Grade Value is required');
    if (!formData.length) errors.push('Length is required');
    if (!formData.width) errors.push('Width is required');
    if (!formData.thickness) errors.push('Thickness is required');
    if (!formData.quantity) errors.push('Quantity is required');

    if (errors.length > 0) {
      setErrorMessage(errors.join(', '));
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    return true;
  };

  const handleScanSuccess = (data) => {
    setFormData({
      ...formData,
      inventoryType: data.inventoryType || '',
      productName: data.productName || '',
      unit: data.unit || '',
      gradeValue: data.gradeValue || '',
      length: data.length || '',
      width: data.width || '',
      thickness: data.thickness || '',
      totalMM: data.totalMM || '',
      quantity: data.quantity || '',
      bundleNumber: data.bundleNumber || '',
      remark: data.remark || ''
    });
    setShowScanner(false);
    setActiveTab('form');
  };

  const handleScanError = (error) => {
    setError(error.toString());
    setShowScanner(false);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    // Validate date range
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    if (start > end) {
      setError('Start date cannot be after end date');
      return;
    }

    setCurrentPage(1); // Reset to first page when filtering
    setError(null);
    fetchLabels();
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    fetchLabels();
  };

  const handleMucSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchLabels();
  };

  const clearSearch = () => {
    setSearchMuc('');
    setCurrentPage(1);
    fetchLabels();
  };

  const renderGenerateForm = () => (
    <div className="card">
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="mucNumber">MUC Number*</label>
            <input
              type="text"
              id="mucNumber"
              name="mucNumber"
              value={formData.mucNumber}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter MUC Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inventoryType">Inventory Type*</label>
            <select
              id="inventoryType"
              name="inventoryType"
              value={formData.inventoryType}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select Type</option>
              <option value="Billing">Billing</option>
              <option value="Non-Billing">Non-Billing</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <select id="productName" name="productName" value={formData.productName} onChange={handleChange} className="form-control">
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product._id} value={product.productName}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="form-control">
              <option value="">Select Unit</option>
              {units.map(unit => (
                <option key={unit._id} value={unit.unitName}>
                  {unit.unitName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gradeValue">Grade Value</label>
            <select id="gradeValue" name="gradeValue" value={formData.gradeValue} onChange={handleChange} className="form-control">
              <option value="">Select Grade Value</option>
              {grades.map(grade => (
                <option key={grade._id} value={grade.gradeName}>
                  {grade.gradeName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="length">Length</label>
            <input 
              type="number" 
              id="length" 
              name="length" 
              value={formData.length} 
              onChange={handleChange} 
              placeholder="Enter length" 
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="width">Width</label>
            <input 
              type="number" 
              id="width" 
              name="width" 
              value={formData.width} 
              onChange={handleChange} 
              placeholder="Enter width" 
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="thickness">Thickness</label>
            <input 
              type="number" 
              id="thickness" 
              name="thickness" 
              value={formData.thickness} 
              onChange={handleChange} 
              placeholder="Enter thickness" 
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalMM">Total MM</label>
            <input 
              type="number" 
              id="totalMM" 
              name="totalMM" 
              value={formData.totalMM} 
              className="form-control" 
              readOnly 
              placeholder="Auto-calculated"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input 
              type="number" 
              id="quantity" 
              name="quantity" 
              value={formData.quantity} 
              onChange={handleChange} 
              placeholder="Enter quantity" 
              className="form-control" 
              min="0" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="bundleNumber">Bundle Number</label>
            <input 
              type="text" 
              id="bundleNumber" 
              name="bundleNumber" 
              value={formData.bundleNumber} 
              onChange={handleChange} 
              placeholder="Enter bundle number" 
              className="form-control" 
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="remark">Remark</label>
            <textarea 
              id="remark" 
              name="remark" 
              value={formData.remark} 
              onChange={handleChange} 
              placeholder="Enter any additional notes here..." 
              className="form-control" 
              rows="3" 
            />
          </div>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave /> Generate Label
          </button>
          <button type="button" className="btn-secondary" onClick={() => setActiveTab('list')}>
            <FaArrowLeft /> Back to List
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => {
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = labels.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(labels.length / itemsPerPage);

    return (
      <div className="card">
        <h2>Generated Labels</h2>
        
        {/* All filters in a single horizontal row */}
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="form-control"
              placeholder="From Date"
            />
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="form-control"
              placeholder="To Date"
            />
            <button 
              onClick={handleDateFilter}
              className="btn-primary"
            >
              Filter
            </button>
            <button 
              onClick={clearDateFilter}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
          <div className="search-group">
            <input
              type="text"
              id="searchMuc"
              value={searchMuc}
              onChange={(e) => setSearchMuc(e.target.value)}
              placeholder="Search MUC number"
              className="form-control"
            />
            <button 
              onClick={handleMucSearch}
              className="btn-primary"
            >
              Search
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>MUC Number</th>
                <th>Inventory Type</th>
                <th>Product Name</th>
                <th>Unit</th>
                <th>Grade</th>
                <th>Length</th>
                <th>Width</th>
                <th>Thickness</th>
                <th>Total MM</th>
                <th>Quantity</th>
                <th>Bundle Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(label => (
                <tr key={label._id}>
                  <td>{label.mucNumber || '-'}</td>
                  <td>{label.inventoryType}</td>
                  <td>{label.productName}</td>
                  <td>{label.unit}</td>
                  <td>{label.gradeValue}</td>
                  <td>{label.length}</td>
                  <td>{label.width}</td>
                  <td>{label.thickness}</td>
                  <td>{label.totalMM}</td>
                  <td>{label.quantity}</td>
                  <td>{label.bundleNumber}</td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(label._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    <PDFDownloadLink
                      document={<LabelPDF labelData={label} />}
                      fileName={`label-${label.mucNumber || label._id}.pdf`}
                      className="btn-icon"
                    >
                      {({ loading }) => (
                        loading ? 'Loading...' : <FaFilePdf />
                      )}
                    </PDFDownloadLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="page-content">
        <div className="page-header">
          <h2>Manual Generate Label</h2>
          <p className="page-description">Generate and manage product labels</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <FaPlus /> Generate
          </button>
          <button
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('list');
              fetchLabels(); // Refresh labels when switching to list tab
            }}
          >
            <span className="btn-icon">☰</span> List
          </button>
        </div>

        {activeTab === 'generate' ? renderGenerateForm() : renderList()}
      </div>
      {dialogOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', padding: 24, borderRadius: 8, minWidth: 300, boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <div style={{ marginBottom: 16 }}>{dialogMessage}</div>
            <button onClick={() => setDialogOpen(false)} style={{ padding: '6px 18px' }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelGenerator; 