import React, { useState, useEffect } from 'react';
import '../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const CountryMaster = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    countryName: '',
    countryCode: '',
    remarks: '',
    status: 'active'
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchCountries = () => {
    setLoading(true);
    axios.get('http://localhost:5000/countries/') // Replace with your backend URL if different
      .then(response => {
        setCountries(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching countries:', err);
        setError('Failed to fetch countries.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchCountries();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveCountry = (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.countryName || !formData.countryCode || !formData.status) {
      alert('Please fill in all required fields (Country Name, Country Code, Status).');
      return;
    }

    if (editingId) {
      axios.post(`http://localhost:5000/countries/update/${editingId}`, formData)
        .then(res => {
          console.log(res.data);
          alert('Country updated successfully!');
          setEditingId(null);
          setFormData({
            countryName: '',
            countryCode: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error updating country:', err);
          alert('Failed to update country.' + err.message);
        });
    } else {
      axios.post('http://localhost:5000/countries/add', formData)
        .then(res => {
          console.log(res.data);
          alert('Country added successfully!');
          setFormData({
            countryName: '',
            countryCode: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error saving country:', err);
          alert('Failed to save country.' + err.message);
        });
    }
  };

  const handleEditCountry = (country) => {
    setEditingId(country._id);
    setFormData({
      countryName: country.countryName,
      countryCode: country.countryCode,
      remarks: country.remarks,
      status: country.status
    });
    setActiveTab('add');
  };

  const handleDeleteCountry = (id) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      axios.delete(`http://localhost:5000/countries/delete/${id}`)
        .then(res => {
          console.log(res.data);
          alert('Country deleted successfully!');
          fetchCountries();
        })
        .catch(err => {
          console.error('Error deleting country:', err);
          alert('Failed to delete country.' + err.message);
        });
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <form onSubmit={handleSaveCountry} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="countryName">Country Name*</label>
            <input
              type="text"
              id="countryName"
              name="countryName"
              value={formData.countryName}
              onChange={handleChange}
              placeholder="Enter country name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="countryCode">Country Code*</label>
            <input
              type="text"
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              placeholder="Enter country code (e.g., US, IN)"
              required
              maxLength="3"
              style={{ textTransform: 'uppercase' }}
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

          <div className="form-group full-width">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter any additional remarks"
              rows="3"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> {editingId ? 'Update Country' : 'Save Country'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({
                countryName: '',
                countryCode: '',
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
        <div className="table-title">Country List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search countries..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Country Name</th>
              <th>Country Code</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center text-danger">{error}</td>
              </tr>
            ) : countries.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No countries found</td>
              </tr>
            ) : (
              countries.map((country) => (
                <tr key={country._id}>
                  <td>{country.countryName}</td>
                  <td>{country.countryCode}</td>
                  <td>
                    <span className={`status-badge ${country.status}`}>
                      {country.status}
                    </span>
                  </td>
                  <td>{country.remarks}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEditCountry(country)}><FaEdit /></button>
                      <button className="btn-icon" title="Delete" onClick={() => handleDeleteCountry(country._id)}><FaTrash /></button>
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
        <h2>Country Master</h2>
        <p className="page-description">Manage country information</p>
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
          <FaList className="btn-icon" /> Country List
        </button>
      </div>

      {activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default CountryMaster; 