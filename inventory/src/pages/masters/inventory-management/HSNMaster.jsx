import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaEdit, FaTrash, FaPlusCircle, FaList } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const HSNMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    hsnCode: '',
    sgst: '',
    cgst: '',
    igst: '',
    description: '',
    status: 'active'
  });
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch HSN codes on component mount
  useEffect(() => {
    fetchHsnCodes();
  }, []);

  const fetchHsnCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/hsn/`);
      setHsnCodes(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching HSN codes: ' + err.message);
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
      if (!formData.hsnCode || !formData.sgst || !formData.cgst || !formData.igst || !formData.status) {
        toast.error('Please fill in all required fields.');
        return;
      }

      const hsnData = {
        hsnCode: formData.hsnCode.trim(),
        sgst: parseFloat(formData.sgst),
        cgst: parseFloat(formData.cgst),
        igst: parseFloat(formData.igst),
        description: formData.description?.trim() || '',
        status: formData.status
      };

      if (editingId) {
        await axios.post(`${API_URL}/hsn/update/${editingId}`, hsnData);
        toast.success('HSN Code updated successfully!');
      } else {
        await axios.post(`${API_URL}/hsn/add`, hsnData);
        toast.success('HSN Code added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        hsnCode: '',
        sgst: '',
        cgst: '',
        igst: '',
        description: '',
        status: 'active'
      });
      setEditingId(null);
      fetchHsnCodes();
      setActiveTab('list');
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message));
      console.error('Error saving HSN code:', err);
    }
  };

  const handleEdit = (hsn) => {
    setFormData({
      hsnCode: hsn.hsnCode || '',
      sgst: hsn.sgst || '',
      cgst: hsn.cgst || '',
      igst: hsn.igst || '',
      description: hsn.description || '',
      status: hsn.status || 'active'
    });
    setEditingId(hsn._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this HSN code?')) {
      try {
        await axios.delete(`${API_URL}/hsn/delete/${id}`);
        toast.success('HSN Code deleted successfully!');
        fetchHsnCodes();
      } catch (err) {
        toast.error('Error: ' + err.message);
        console.error('Error deleting HSN code:', err);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit HSN Code' : 'Add New HSN Code'}</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="hsnCode">HSN Code*</label>
            <input
              type="text"
              id="hsnCode"
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleChange}
              placeholder="Enter HSN code"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sgst">SGST (%)*</label>
            <input
              type="number"
              id="sgst"
              name="sgst"
              value={formData.sgst}
              onChange={handleChange}
              placeholder="Enter SGST percentage"
              required
              className="form-control"
              step="0.01"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cgst">CGST (%)*</label>
            <input
              type="number"
              id="cgst"
              name="cgst"
              value={formData.cgst}
              onChange={handleChange}
              placeholder="Enter CGST percentage"
              required
              className="form-control"
              step="0.01"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="igst">IGST (%)*</label>
            <input
              type="number"
              id="igst"
              name="igst"
              value={formData.igst}
              onChange={handleChange}
              placeholder="Enter IGST percentage"
              required
              className="form-control"
              step="0.01"
              min="0"
              max="100"
            />
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
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
                hsnCode: '',
                sgst: '',
                cgst: '',
                igst: '',
                description: '',
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
        <div className="table-title">HSN List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search HSN codes..."
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
                <th>HSN Code</th>
                <th>SGST (%)</th>
                <th>CGST (%)</th>
                <th>IGST (%)</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hsnCodes.map(hsn => (
                <tr key={hsn._id}>
                  <td>{hsn.hsnCode}</td>
                  <td>{hsn.sgst}</td>
                  <td>{hsn.cgst}</td>
                  <td>{hsn.igst}</td>
                  <td>{hsn.status}</td>
                  <td>{hsn.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(hsn)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(hsn._id)}
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
        <h2>HSN Master</h2>
        <p className="page-description">Manage HSN codes and tax rates</p>
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

export default HSNMaster; 