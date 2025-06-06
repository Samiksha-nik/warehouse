import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/shared.css';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaFilePdf } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LabelPDF from '../../component/LabelPDF';
import QRScanner from '../../component/QRScanner';

const LabelGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [grades, setGrades] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
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
      const response = await axios.get('http://localhost:5000/products');
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
      const response = await axios.get('http://localhost:5000/units');
      setUnits(response.data);
    } catch (err) {
      setError('Error fetching units: ' + err.message);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get('http://localhost:5000/grades');
      setGrades(response.data);
    } catch (err) {
      setError('Error fetching grades: ' + err.message);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await axios.get('http://localhost:5000/labels');
      setLabels(response.data);
    } catch (err) {
      setError('Error fetching labels: ' + err.message);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log('Submitting form data:', formData);

      const formattedData = {
        ...formData,
        totalMM: parseFloat(formData.totalMM) || 0
      };

      console.log('Formatted data:', formattedData);

      const response = await axios.post('http://localhost:5000/api/labels', formattedData);
      setLabels([...labels, response.data]);
      setFormData({
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
        await axios.delete(`http://localhost:5000/api/labels/${id}`);
        alert('Label deleted successfully!');
        fetchLabels();
      } catch (err) {
        alert('Error deleting label: ' + err.message);
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.inventoryType) errors.push('Inventory Type is required');
    if (!formData.productName) errors.push('Product Name is required');
    if (!formData.unit) errors.push('Unit is required');
    if (!formData.gradeValue) errors.push('Grade Value is required');
    if (!formData.length) errors.push('Length is required');
    if (!formData.width) errors.push('Width is required');
    if (!formData.thickness) errors.push('Thickness is required');
    if (!formData.quantity) errors.push('Quantity is required');
    if (!formData.bundleNumber) errors.push('Bundle Number is required');

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

  const renderGenerateForm = () => (
    <div className="card">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="inventoryType">Inventory Type</label>
              <select id="inventoryType" name="inventoryType" value={formData.inventoryType} onChange={handleChange} className="form-control">
                <option value="">Select Inventory Type</option>
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

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <span className="btn-icon"><FaSave /></span>
              Generate Label
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFormData({
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
                setErrorMessage('');
              }}
            >
              <span className="btn-icon"><FaTimes /></span>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Generated Labels List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search labels..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thickness</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total MM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labels.map((label) => (
                  <tr key={label._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{label.labelNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.inventoryType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.gradeValue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.width}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.thickness}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.totalMM}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.bundleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{label.remark}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <PDFDownloadLink
                          document={<LabelPDF labelData={label} />}
                          fileName={`label-${label.labelNumber}.pdf`}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                        >
                          {({ blob, url, loading, error }) =>
                            loading ? 'Loading...' : <FaFilePdf className="mr-1" />
                          }
                        </PDFDownloadLink>
                        <button
                          onClick={() => handleDelete(label._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

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
    </div>
  );
};

export default LabelGenerator; 