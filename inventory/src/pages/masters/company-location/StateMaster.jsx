import React, { useState, useEffect } from 'react';
import '../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const StateMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    stateName: '',
    stateCode: '',
    country: '', // Store country ID
    remarks: '',
    status: 'active'
  });
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]); // State for countries for the dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // To store the ID of the state being edited

  // Fetch countries for the dropdown
  const fetchCountries = () => {
    axios.get(`${API_URL}/countries/`)
      .then(response => {
        setCountries(response.data);
      })
      .catch(err => {
        console.error('Error fetching countries:', err);
      });
  };

  // Fetch states for the list
  const fetchStates = () => {
    setLoading(true);
    axios.get(`${API_URL}/states/`)
      .then(response => {
        setStates(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching states:', err);
        setError('Failed to fetch states.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCountries(); // Fetch countries when component mounts
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchStates(); // Fetch states when switching to list tab
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveState = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.stateName || !formData.stateCode || !formData.country || !formData.status) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingId) {
      axios.post(`${API_URL}/states/update/${editingId}`, formData)
        .then(res => {
          console.log(res.data);
          alert('State updated successfully!');
          setEditingId(null);
          setFormData({
            stateName: '',
            stateCode: '',
            country: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error updating state:', err);
          alert('Failed to update state.' + err.message);
        });
    } else {
      axios.post(`${API_URL}/states/add`, formData)
        .then(res => {
          console.log(res.data);
          alert('State added successfully!');
          setFormData({
            stateName: '',
            stateCode: '',
            country: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error saving state:', err);
          alert('Failed to save state.' + err.message);
        });
    }
  };

   const handleEditState = (state) => {
    setEditingId(state._id);
    setFormData({
      stateName: state.stateName,
      stateCode: state.stateCode,
      country: state.country._id, // Set country ID for editing
      remarks: state.remarks,
      status: state.status
    });
    setActiveTab('add'); // Switch to add tab for editing
  };

  const handleDeleteState = (id) => {
    if (window.confirm('Are you sure you want to delete this state?')) {
      axios.delete(`${API_URL}/states/delete/${id}`)
        .then(res => {
          console.log(res.data);
          alert('State deleted successfully!');
          fetchStates();
        })
        .catch(err => {
          console.error('Error deleting state:', err);
          alert('Failed to delete state.' + err.message);
        });
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <form onSubmit={handleSaveState} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="stateName">State Name*</label>
            <input
              type="text"
              id="stateName"
              name="stateName"
              value={formData.stateName}
              onChange={handleInputChange}
              placeholder="Enter state name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stateCode">State Code*</label>
            <input
              type="text"
              id="stateCode"
              name="stateCode"
              value={formData.stateCode}
              onChange={handleInputChange}
              placeholder="Enter state code (e.g., CA, NY)"
              required
              maxLength="3"
              style={{ textTransform: 'uppercase' }}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country*</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select Country -</option>
              {countries.map(country => (
                <option key={country._id} value={country._id}>{country.countryName}</option>
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
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Enter any additional remarks"
              rows="3"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> {editingId ? 'Update State' : 'Save State'}
          </button>
           {editingId && (
            <button type="button" className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({
                stateName: '',
                stateCode: '',
                country: '',
                remarks: '',
                status: 'active'
              });
            }}> 
              <FaTimes className="btn-icon" /> Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">State List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search states..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>State Name</th>
              <th>State Code</th>
              <th>Country</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center text-danger">{error}</td>
              </tr>
            ) : states.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No states found</td>
              </tr>
            ) : (
              states.map((state) => (
                <tr key={state._id}>
                  <td>{state.stateName}</td>
                  <td>{state.stateCode}</td>
                  <td>{state.country?.countryName || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${state.status}`}>
                      {state.status}
                    </span>
                  </td>
                  <td>{state.remarks}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEditState(state)}><FaEdit /></button>
                      <button className="btn-icon" title="Delete" onClick={() => handleDeleteState(state._id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>State Master</h2>
        <p className="page-description">Manage state information</p>
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
          <FaList className="btn-icon" /> State List
        </button>
      </div>

      {activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default StateMaster; 