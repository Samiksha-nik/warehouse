import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaEdit, FaTrash, FaPlusCircle, FaList } from 'react-icons/fa';

const CategoryMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    categoryName: '',
    remarks: '',
    generateInnerLabel: 'no',
    status: 'active'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/categories/');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    } finally {
      setLoading(false);
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
      if (!formData.categoryName || !formData.generateInnerLabel || !formData.status) {
        alert('Please fill in all required fields.');
        return;
      }

      const categoryData = {
        categoryName: formData.categoryName.trim(),
        remarks: formData.remarks?.trim() || '',
        generateInnerLabel: formData.generateInnerLabel,
        status: formData.status
      };

      if (editingId) {
        await axios.post(`http://localhost:5000/categories/update/${editingId}`, categoryData);
        alert('Category updated successfully!');
      } else {
        await axios.post('http://localhost:5000/categories/add', categoryData);
        alert('Category added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        categoryName: '',
        remarks: '',
        generateInnerLabel: 'no',
        status: 'active'
      });
      setEditingId(null);
      fetchCategories();
      setActiveTab('list');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
      console.error('Error saving category:', err);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName || '',
      remarks: category.remarks || '',
      generateInnerLabel: category.generateInnerLabel || 'no',
      status: category.status || 'active'
    });
    setEditingId(category._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`http://localhost:5000/categories/delete/${id}`);
        alert('Category deleted successfully!');
        fetchCategories();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error deleting category:', err);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="categoryName">Category Name*</label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="Enter category name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Generate Inner Label*</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="generateInnerLabel"
                  value="yes"
                  checked={formData.generateInnerLabel === 'yes'}
                  onChange={handleChange}
                  required
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="generateInnerLabel"
                  value="no"
                  checked={formData.generateInnerLabel === 'no'}
                  onChange={handleChange}
                  required
                />
                <span>No</span>
              </label>
            </div>
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
                categoryName: '',
                remarks: '',
                generateInnerLabel: 'no',
                status: 'active'
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
        <div className="table-title">Category List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search categories..."
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Generate Inner Label</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category._id}>
                  <td>{category.categoryName}</td>
                  <td>{category.generateInnerLabel}</td>
                  <td>{category.status}</td>
                  <td>{category.remarks}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(category)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(category._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Category Master</h2>
        <p className="page-description">Manage product categories</p>
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

export default CategoryMaster; 