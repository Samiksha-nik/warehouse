import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaEdit, FaTrash, FaPlusCircle, FaList } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const GradeMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    gradeName: '',
    gradeValue: '',
    status: 'active',
    remarks: ''
  });
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch grades on component mount
  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/grades/`);
      setGrades(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching grades: ' + err.message);
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
      if (!formData.gradeName || !formData.gradeValue) {
        alert('Please fill in required fields (Grade Name and Grade Value).');
        return;
      }

      const gradeData = {
        gradeName: formData.gradeName.trim(),
        gradeValue: parseFloat(formData.gradeValue),
        status: formData.status || 'active',
        remarks: formData.remarks?.trim() || ''
      };

      if (editingId) {
        await axios.post(`${API_URL}/grades/update/${editingId}`, gradeData);
        alert('Grade updated successfully!');
      } else {
        await axios.post(`${API_URL}/grades/add`, gradeData);
        alert('Grade added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        gradeName: '',
        gradeValue: '',
        status: 'active',
        remarks: ''
      });
      setEditingId(null);
      fetchGrades();
      setActiveTab('list');
    } catch (err) {
       alert('Error: ' + (err.response?.data?.message || err.message));
       console.error('Error saving grade:', err);
    }
  };

  const handleEdit = (grade) => {
    setFormData({
      gradeName: grade.gradeName || '',
      gradeValue: grade.gradeValue || '',
      status: grade.status || 'active',
      remarks: grade.remarks || ''
    });
    setEditingId(grade._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await axios.delete(`${API_URL}/grades/delete/${id}`);
        alert('Grade deleted successfully!');
        fetchGrades();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error deleting grade:', err);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Grade' : 'Add New Grade'}</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="gradeName">Grade Name*</label>
            <input
              type="text"
              id="gradeName"
              name="gradeName"
              value={formData.gradeName}
              onChange={handleChange}
              placeholder="Enter grade name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gradeValue">Grade Value (MM)*</label>
            <input
              type="number"
              id="gradeValue"
              name="gradeValue"
              value={formData.gradeValue}
              onChange={handleChange}
              placeholder="Enter grade value in MM"
              required
              className="form-control"
              step="0.01"
              min="0"
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
                gradeName: '',
                gradeValue: '',
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
        <div className="table-title">Grade List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search grades..."
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
                <th>Grade Name</th>
                <th>Grade Value (MM)</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => (
                <tr key={grade._id}>
                  <td>{grade.gradeName}</td>
                  <td>{grade.gradeValue}</td>
                  <td>{grade.status}</td>
                  <td>{grade.remarks}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(grade)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(grade._id)}
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
        <h2>Grade Master</h2>
        <p className="page-description">Manage material grades</p>
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

export default GradeMaster; 