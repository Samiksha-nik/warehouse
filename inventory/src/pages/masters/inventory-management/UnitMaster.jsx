import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const UnitMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    unitName: '',
    govtUnitCode: '',
    status: 'active'
  });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch units on component mount
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/units/`);
      setUnits(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching units: ' + err.message);
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
      if (editingId) {
        await axios.post(`${API_URL}/units/update/${editingId}`, formData);
        toast.success('Unit updated successfully!');
      } else {
        await axios.post(`${API_URL}/units/add`, formData);
        toast.success('Unit added successfully!');
      }
      
      // Reset form and refresh list
      setFormData({
        unitName: '',
        govtUnitCode: '',
        status: 'active'
      });
      setEditingId(null);
      fetchUnits();
      setActiveTab('list');
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (unit) => {
    setFormData({
      unitName: unit.unitName,
      govtUnitCode: unit.govtUnitCode,
      status: unit.status
    });
    setEditingId(unit._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await axios.delete(`${API_URL}/units/delete/${id}`);
        toast.success('Unit deleted successfully!');
        fetchUnits();
      } catch (err) {
        toast.error('Error: ' + err.message);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Unit' : 'Add New Unit'}</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="unitName">Unit Name*</label>
            <input
              type="text"
              id="unitName"
              name="unitName"
              value={formData.unitName}
              onChange={handleChange}
              placeholder="Enter unit name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="govtUnitCode">Government Unit Code</label>
            <input
              type="text"
              id="govtUnitCode"
              name="govtUnitCode"
              value={formData.govtUnitCode}
              onChange={handleChange}
              placeholder="Enter government unit code"
              className="form-control"
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
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> {editingId ? 'Update' : 'Save'} Unit
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              setFormData({
                unitName: '',
                govtUnitCode: '',
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
        <div className="table-title">Unit List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search units..."
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
                <th>Unit Name</th>
                <th>Government Unit Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map(unit => (
                <tr key={unit._id}>
                  <td>{unit.unitName}</td>
                  <td>{unit.govtUnitCode}</td>
                  <td>{unit.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(unit)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(unit._id)}
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
        <h2>Unit Master</h2>
        <p className="page-description">Manage measurement units</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Unit
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Unit List
        </button>
      </div>

      {activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default UnitMaster; 