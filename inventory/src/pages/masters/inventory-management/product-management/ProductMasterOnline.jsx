import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const ProductMasterOnline = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    skuCode: '',
    productId: '',
    category: '', // Store category ID
    productName: '',
    grade: '', // Store grade ID
    thickness: '',
    length: '',
    width: '',
    weight: '',
    hsnCode: '', // Store HSN ID
    mrp: ''
  });

  const [productsOnline, setProductsOnline] = useState([]);
  const [products, setProducts] = useState([]); // Add state for products from ProductMaster
  const [categories, setCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch initial data (products, categories, grades, hsnCodes) on component mount
  useEffect(() => {
    fetchProductsOnline();
    fetchProducts(); // Add fetch for products from ProductMaster
    fetchCategories();
    fetchGrades();
    fetchHsnCodes();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Error fetching products: ' + err.message);
    }
  };

  const fetchProductsOnline = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products-online`);
      setProductsOnline(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching products online: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/`);
      setCategories(response.data);
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${API_URL}/grades/`);
      setGrades(response.data);
    } catch (err) {
      setError('Error fetching grades: ' + err.message);
    }
  };

  const fetchHsnCodes = async () => {
    try {
      const response = await axios.get(`${API_URL}/hsn/`);
      setHsnCodes(response.data);
    } catch (err) {
      setError('Error fetching HSN codes: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveProductOnline = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.skuCode || !formData.productId || !formData.category || !formData.productName || !formData.grade || !formData.thickness || !formData.length || !formData.width || !formData.weight || !formData.hsnCode || !formData.mrp) {
        alert('Please fill in all required fields.');
        return;
      }

      const productOnlineData = {
        skuCode: formData.skuCode.trim(),
        productId: formData.productId.trim(),
        category: formData.category,
        productName: formData.productName.trim(),
        grade: formData.grade,
        thickness: formData.thickness.trim(),
        length: formData.length.trim(),
        width: formData.width.trim(),
        weight: formData.weight.trim(),
        hsnCode: formData.hsnCode,
        mrp: parseFloat(formData.mrp) // Ensure MRP is a number
      };

      console.log('Sending data to server:', productOnlineData);

      if (editingId) {
        await axios.put(`${API_URL}/products-online/${editingId}`, productOnlineData);
        alert('Product online updated successfully!');
      } else {
        try {
          const response = await axios.post(`${API_URL}/products-online`, productOnlineData);
          console.log('Server response:', response.data);
          alert('Product online added successfully!');
          // Reset form and refresh list
          setFormData({
            skuCode: '',
            productId: '',
            category: '',
            productName: '',
            grade: '',
            thickness: '',
            length: '',
            width: '',
            weight: '',
            hsnCode: '',
            mrp: ''
          });
          setEditingId(null);
          fetchProductsOnline();
          setActiveTab('list');
        } catch (err) {
          console.error('Error saving product:', err);
          alert('Failed to save product: ' + err.message);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred: ' + err.message);
    }
  };

  const handleEdit = (productOnline) => {
    setFormData({
      skuCode: productOnline.skuCode || '',
      productId: productOnline.productId || '',
      category: productOnline.category?._id || '',
      productName: productOnline.productName || '',
      grade: productOnline.grade?._id || '',
      thickness: productOnline.thickness || '',
      length: productOnline.length || '',
      width: productOnline.width || '',
      weight: productOnline.weight || '',
      hsnCode: productOnline.hsnCode?._id || '',
      mrp: productOnline.mrp || ''
    });
    setEditingId(productOnline._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products-online/${id}`);
        alert('Product deleted successfully!');
        fetchProductsOnline();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Product Online' : 'Add New Product Online'}</h2>
      <form onSubmit={handleSaveProductOnline} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="skuCode">SKU Code*</label>
            <input
              type="text"
              id="skuCode"
              name="skuCode"
              value={formData.skuCode}
              onChange={handleInputChange}
              placeholder="Enter SKU code"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="productId">Product ID*</label>
            <input
              type="text"
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              placeholder="Enter Product ID"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product Name*</label>
            <select
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product._id} value={product.productName}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade*</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select Grade -</option>
              {grades.map(grade => (
                <option key={grade._id} value={grade._id}>
                  {grade.gradeName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="thickness">Thickness*</label>
            <input
              type="text"
              id="thickness"
              name="thickness"
              value={formData.thickness}
              onChange={handleInputChange}
              placeholder="Enter thickness"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="length">Length*</label>
            <input
              type="text"
              id="length"
              name="length"
              value={formData.length}
              onChange={handleInputChange}
              placeholder="Enter length"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="width">Width*</label>
            <input
              type="text"
              id="width"
              name="width"
              value={formData.width}
              onChange={handleInputChange}
              placeholder="Enter width"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight*</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="Enter weight"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hsnCode">HSN Code*</label>
            <select
              id="hsnCode"
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleInputChange}
              required
              className="form-control"
            >
               <option value="">- Select HSN Code -</option>
               {hsnCodes.map(hsn => (
                <option key={hsn._id} value={hsn._id}>
                  {hsn.hsnCode} ({hsn.sgst + hsn.cgst + hsn.igst}%) {/* Display HSN code and total tax % */}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mrp">MRP*</label>
            <input
              type="number"
              id="mrp"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              placeholder="Enter MRP"
              required
              className="form-control"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> {editingId ? 'Update' : 'Save'}
          </button>
           <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFormData({
                skuCode: '',
                productId: '',
                category: '',
                productName: '',
                grade: '',
                thickness: '',
                length: '',
                width: '',
                weight: '',
                hsnCode: '',
                mrp: ''
              });
              setEditingId(null);
            }}
          >
            <FaTimes className="btn-icon" /> Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
       <div className="table-header">
        <div className="table-title">Product Online List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search products online..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (Array.isArray(productsOnline) && productsOnline.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Grade</th>
                <th>Thickness</th>
                <th>Length</th>
                <th>Width</th>
                <th>Weight</th>
                <th>HSN Code</th>
                <th>MRP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsOnline.map(productOnline => (
                <tr key={productOnline._id}>
                  <td>{productOnline.skuCode}</td>
                  <td>{productOnline.productId}</td>
                  <td>{productOnline.productName}</td>
                  <td>{productOnline.category ? productOnline.category.categoryName : 'N/A'}</td>
                  <td>{productOnline.grade ? productOnline.grade.gradeName : 'N/A'}</td>
                  <td>{productOnline.thickness}</td>
                  <td>{productOnline.length}</td>
                  <td>{productOnline.width}</td>
                  <td>{productOnline.weight}</td>
                  <td>{productOnline.hsnCode ? productOnline.hsnCode.hsnCode : 'N/A'}</td>
                  <td>{productOnline.mrp}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(productOnline)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(productOnline._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
           <p>No products online found.</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Product Master Online</h2>
        <p className="page-description">Manage your online products</p>
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

export default ProductMasterOnline; 