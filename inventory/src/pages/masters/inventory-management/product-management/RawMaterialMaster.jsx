import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../../styles/shared.css';
import { FaSave, FaTimes, FaPlus, FaList, FaEdit, FaTrash } from 'react-icons/fa';

const RawMaterialMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    category: '', // Store category ID
    subCategory: '', // Store subcategory ID
    description: '',
    grade: '', // Store grade ID
    thickness: '',
    unit: '', // Store unit ID
    hsnCode: '', // Store HSN ID
    status: 'active',
  });

  const [rawMaterials, setRawMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const [units, setUnits] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchRawMaterials();
    fetchCategories();
    fetchGrades();
    fetchUnits();
    fetchHsnCodes();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
    } else {
      setSubCategories([]);
    }
  }, [formData.category]);

  const fetchRawMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/raw-materials/');
      setRawMaterials(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching raw materials: ' + err.message);
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

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:5000/subcategories/category/${categoryId}`);
      setSubCategories(response.data);
    } catch (err) {
      setError('Error fetching subcategories: ' + err.message);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get('http://localhost:5000/grades/');
      setGrades(response.data);
    } catch (err) {
      setError('Error fetching grades: ' + err.message);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get('http://localhost:5000/units/');
      setUnits(response.data);
    } catch (err) {
      setError('Error fetching units: ' + err.message);
    }
  };

  const fetchHsnCodes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/hsn/');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.itemName || !formData.itemCode || !formData.category || !formData.unit || !formData.hsnCode || !formData.status) {
        alert('Please fill in all required fields.');
        return;
      }

      const rawMaterialData = {
        itemName: formData.itemName.trim(),
        itemCode: formData.itemCode.trim(),
        category: formData.category,
        subCategory: formData.subCategory || null,
        description: formData.description?.trim() || '',
        grade: formData.grade || null,
        thickness: formData.thickness?.trim() || '',
        unit: formData.unit,
        hsnCode: formData.hsnCode,
        status: formData.status
      };

      if (editingId) {
        await axios.post(`http://localhost:5000/raw-materials/update/${editingId}`, rawMaterialData);
        alert('Raw material updated successfully!');
      } else {
        await axios.post('http://localhost:5000/raw-materials/add', rawMaterialData);
        alert('Raw material added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        itemName: '',
        itemCode: '',
        category: '',
        subCategory: '',
        description: '',
        grade: '',
        thickness: '',
        unit: '',
        hsnCode: '',
        status: 'active'
      });
      setEditingId(null);
      fetchRawMaterials();
      setActiveTab('list');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
      console.error('Error saving raw material:', err);
    }
  };

  const handleEdit = (rawMaterial) => {
    setFormData({
      itemName: rawMaterial.itemName || '',
      itemCode: rawMaterial.itemCode || '',
      category: rawMaterial.category?._id || '',
      subCategory: rawMaterial.subCategory?._id || '',
      description: rawMaterial.description || '',
      grade: rawMaterial.grade?._id || '',
      thickness: rawMaterial.thickness || '',
      unit: rawMaterial.unit?._id || '',
      hsnCode: rawMaterial.hsnCode?._id || '',
      status: rawMaterial.status || 'active'
    });
    setEditingId(rawMaterial._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        await axios.delete(`http://localhost:5000/raw-materials/delete/${id}`);
        alert('Raw material deleted successfully!');
        fetchRawMaterials();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error deleting raw material:', err);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Raw Material' : 'Add New Raw Material'}</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="itemName">Item Name*</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              placeholder="Enter item name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="itemCode">Item Code*</label>
            <input
              type="text"
              id="itemCode"
              name="itemCode"
              value={formData.itemCode}
              onChange={handleInputChange}
              placeholder="Enter item code"
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
            <label htmlFor="subCategory">Sub Category Name</label>
            <select
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="form-control"
              disabled={!formData.category}
            >
              <option value="">- Select Sub Category -</option>
              {subCategories.map(subCategory => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.subCategoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
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
            <label htmlFor="thickness">Thickness</label>
            <input
              type="text"
              id="thickness"
              name="thickness"
              value={formData.thickness}
              onChange={handleInputChange}
              placeholder="Enter thickness"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit*</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select Unit -</option>
              {units.map(unit => (
                <option key={unit._id} value={unit._id}>
                  {unit.unitName}
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
                  {hsn.hsnCode} ({hsn.sgst + hsn.cgst + hsn.igst}%)
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

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
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
                itemName: '',
                itemCode: '',
                category: '',
                subCategory: '',
                description: '',
                grade: '',
                thickness: '',
                unit: '',
                hsnCode: '',
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
        <div className="table-title">Raw Material List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search raw materials..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (Array.isArray(rawMaterials) && rawMaterials.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Grade</th>
                <th>Thickness</th>
                <th>Unit</th>
                <th>HSN Code</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rawMaterials.map(rawMaterial => (
                <tr key={rawMaterial._id}>
                  <td>{rawMaterial.itemName}</td>
                  <td>{rawMaterial.itemCode}</td>
                  <td>{rawMaterial.category ? rawMaterial.category.categoryName : 'N/A'}</td>
                  <td>{rawMaterial.subCategory ? rawMaterial.subCategory.subCategoryName : 'N/A'}</td>
                  <td>{rawMaterial.grade ? rawMaterial.grade.gradeName : 'N/A'}</td>
                  <td>{rawMaterial.thickness}</td>
                  <td>{rawMaterial.unit ? rawMaterial.unit.unitName : 'N/A'}</td>
                  <td>{rawMaterial.hsnCode ? rawMaterial.hsnCode.hsnCode : 'N/A'}</td>
                  <td>{rawMaterial.status}</td>
                  <td>{rawMaterial.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(rawMaterial)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(rawMaterial._id)}
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
          <p>No raw materials found.</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Raw Material Master</h2>
        <p className="page-description">Manage raw material inventory</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <FaPlus className="btn-icon" /> Add Raw Material
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

export default RawMaterialMaster; 