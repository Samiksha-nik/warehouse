import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../../styles/shared.css';
import { FaUpload, FaPlus, FaSave, FaLeaf, FaTimes, FaList, FaPlusCircle, FaEdit, FaTrash } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const ProductMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    productName: '',
    category: '', // Store category ID
    hsnCode: '', // Store HSN ID
    status: 'active',
    generateBagLabel: '',
    departments: [] // Array to store department objects
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [newDepartment, setNewDepartment] = useState({ department: '', sequence: '' });

  // Fetch initial data (products, categories, hsnCodes) on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchHsnCodes();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching products: ' + err.message);
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

  const handleNewDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddDepartment = () => {
    if (newDepartment.department && newDepartment.sequence !== '') {
      setFormData(prev => ({ 
        ...prev, 
        departments: [...prev.departments, newDepartment] 
      }));
      setNewDepartment({ department: '', sequence: '' });
    } else {
      alert('Please select a department and enter a sequence.');
    }
  };

  const handleRemoveDepartment = (index) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.productName || !formData.category || !formData.hsnCode || !formData.status) {
        alert('Please fill in all required fields (Product Name, Category, HSN Code, and Status).');
        return;
      }

      const productData = {
        productName: formData.productName.trim(),
        category: formData.category,
        hsnCode: formData.hsnCode,
        status: formData.status,
        generateBagLabel: formData.generateBagLabel?.trim() || '',
        departments: formData.departments // Include departments array
      };

      if (editingId) {
        await axios.post(`${API_URL}/products/update/${editingId}`, productData);
        alert('Product updated successfully!');
      } else {
        await axios.post(`${API_URL}/products/add`, productData);
        alert('Product added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        productName: '',
        category: '',
        hsnCode: '',
        status: 'active',
        generateBagLabel: '',
        departments: []
      });
      setEditingId(null);
      fetchProducts();
      setActiveTab('list');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      productName: product.productName || '',
      category: product.category?._id || '', // Populate with category ID
      hsnCode: product.hsnCode?._id || '', // Populate with HSN ID
      status: product.status || 'active',
      generateBagLabel: product.generateBagLabel || '',
      departments: Array.isArray(product.departments) ? product.departments : [] // Populate departments array
    });
    setEditingId(product._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/delete/${id}`);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error deleting product:', err);
      }
    }
  };


  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSaveProduct} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="productName">Product Name*</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category Name*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select Category -</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
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
                  {hsn.hsnCode}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status*</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

           <div className="form-group">
            <label htmlFor="generateBagLabel">Generate Bag Label</label>
            <input
              type="text"
              id="generateBagLabel"
              name="generateBagLabel"
              value={formData.generateBagLabel}
              onChange={handleInputChange}
              placeholder="Enter bag label info"
              className="form-control"
            />
          </div>

           <div className="form-group">{/* Empty group for layout */}</div>
           {/* <div className="form-group"></div> Empty group for layout */}

        </div>

        <div className="card-header">Department Linking</div>
           <div className="table-container">
             <table className="data-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Department</th>
                  <th>Sequence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.departments.map((dept, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <select
                        name="department"
                        value={dept.department}
                        onChange={(e) => {
                          const newDepts = [...formData.departments];
                          newDepts[index].department = e.target.value;
                          setFormData(prev => ({...prev, departments: newDepts }));
                        }}
                        className="form-control"
                      >
                        <option value="">Select Department</option>
                        {/* Static department options for now - could fetch from a Department Master later */}
                        <option value="Mattress Packing">Mattress Packing</option>
                        <option value="Pasting (Mattress)">Pasting (Mattress)</option>
                        <option value="Cutting/Packing">Cutting/Packing</option>
                        <option value="Tailoring">Tailoring</option>
                        <option value="QC">QC</option>
                        <option value="CNC">CNC</option>
                        <option value="Fabric Cutting">Fabric Cutting</option>
                        <option value="Pasting (Dr.Back)">Pasting (Dr.Back)</option>
                      </select>
                    </td>
                   <td>
                    <input
                       type="number"
                       name="sequence"
                       value={dept.sequence}
                       onChange={(e) => {
                          const newDepts = [...formData.departments];
                          newDepts[index].sequence = e.target.value;
                          setFormData(prev => ({...prev, departments: newDepts }));
                        }}
                       placeholder="Sequence"
                       className="form-control"
                       min="0"
                    />
                  </td>
                    <td>
                       <button
                         type="button"
                         className="btn-danger btn-icon-only"
                         onClick={() => handleRemoveDepartment(index)}
                       >
                         <FaTimes />
                       </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>{formData.departments.length + 1}</td>
                  <td>
                    <select
                      name="department"
                      value={newDepartment.department}
                      onChange={handleNewDepartmentChange}
                      className="form-control"
                    >
                      <option value="">Select Department</option>
                       {/* Static department options for now */}
                      <option value="Mattress Packing">Mattress Packing</option>
                      <option value="Pasting (Mattress)">Pasting (Mattress)</option>
                      <option value="Cutting/Packing">Cutting/Packing</option>
                      <option value="Tailoring">Tailoring</option>
                      <option value="QC">QC</option>
                      <option value="CNC">CNC</option>
                      <option value="Fabric Cutting">Fabric Cutting</option>
                      <option value="Pasting (Dr.Back)">Pasting (Dr.Back)</option>
                    </select>
                  </td>
                   <td>
                    <input
                       type="number"
                       name="sequence"
                       value={newDepartment.sequence}
                       onChange={handleNewDepartmentChange}
                       placeholder="Sequence"
                       className="form-control"
                       min="0"
                    />
                  </td>
                  <td>
                     <button
                       type="button"
                       className="btn-primary btn-icon-only"
                       onClick={handleAddDepartment}
                     >
                       <FaPlus />
                     </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
                productName: '',
                category: '',
                hsnCode: '',
                status: 'active',
                generateBagLabel: '',
                departments: []
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
        <div className="table-title">Product List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search products..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (Array.isArray(products) && products.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>HSN Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.productName}</td>
                  <td>{product.category ? product.category.categoryName : 'N/A'}</td>
                  <td>{product.hsnCode ? product.hsnCode.hsnCode : 'N/A'}</td>
                  <td>{product.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(product)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(product._id)}
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
           <p>No products found.</p>
        ))}
      </div>
    </div>
  );


  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Product Master</h2>
        <p className="page-description">Manage your products</p>
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

export default ProductMaster; 