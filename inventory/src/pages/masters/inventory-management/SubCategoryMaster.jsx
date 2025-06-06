import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaEdit, FaTrash, FaPlusCircle, FaList } from 'react-icons/fa';

const SubCategoryMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    subCategoryName: '',
    category: '', // Store category ID
    status: 'active',
    remarks: ''
  });
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]); // To populate the category dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch sub-categories and categories on component mount
  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      // Fetch sub-categories and populate the category field
      const response = await axios.get('http://localhost:5000/sub-categories/');
      setSubCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching sub-categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories/');
      setCategories(response.data);
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.subCategoryName || !formData.category || !formData.status) {
        alert('Please fill in all required fields (Sub Category Name, Category, and Status).');
        return;
      }

      const subCategoryData = {
        subCategoryName: formData.subCategoryName.trim(),
        category: formData.category,
        status: formData.status,
        remarks: formData.remarks?.trim() || ''
      };

      if (editingId) {
        await axios.post(`http://localhost:5000/sub-categories/update/${editingId}`, subCategoryData);
        alert('Sub Category updated successfully!');
      } else {
        await axios.post('http://localhost:5000/sub-categories/add', subCategoryData);
        alert('Sub Category added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        subCategoryName: '',
        category: '',
        status: 'active',
        remarks: ''
      });
      setEditingId(null);
      fetchSubCategories();
      setActiveTab('list');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
      console.error('Error saving sub-category:', err);
    }
  };

  const handleEdit = (subCategory) => {
    setFormData({
      subCategoryName: subCategory.subCategoryName || '',
      category: subCategory.category?._id || '', // Populate with category ID
      status: subCategory.status || 'active',
      remarks: subCategory.remarks || ''
    });
    setEditingId(subCategory._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub category?')) {
      try {
        await axios.delete(`http://localhost:5000/sub-categories/delete/${id}`);
        alert('Sub Category deleted successfully!');
        fetchSubCategories();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error deleting sub-category:', err);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Sub Category' : 'Add New Sub Category'}</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="subCategoryName">Sub Category Name*</label>
            <input
              type="text"
              id="subCategoryName"
              name="subCategoryName"
              value={formData.subCategoryName}
              onChange={handleChange}
              placeholder="Enter sub category name"
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
              onChange={handleChange}
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
            <label htmlFor="status">Status*</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks"
              className="form-control"
              rows="3"
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
                subCategoryName: '',
                category: '',
                status: 'active',
                remarks: ''
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
        <div className="table-title">Sub Category List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search sub categories..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (Array.isArray(subCategories) && subCategories.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sub Category Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subCategories.map(subCategory => (
                <tr key={subCategory._id}>
                  <td>{subCategory.subCategoryName}</td>
                  <td>{subCategory.category ? subCategory.category.categoryName : 'N/A'}</td>
                  <td>{subCategory.status}</td>
                  <td>{subCategory.remarks}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(subCategory)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(subCategory._id)}
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
           <p>No sub categories found.</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Sub Category Master</h2>
        <p className="page-description">Manage product sub categories</p>
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

export default SubCategoryMaster; 