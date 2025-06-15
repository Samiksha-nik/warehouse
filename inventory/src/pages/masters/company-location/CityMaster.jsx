import React, { useState, useEffect } from 'react';
import '../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const CityMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    cityName: '',
    cityCode: '',
    state: '', // Store state ID
    country: '', // Store country ID
    remarks: '',
    status: 'active'
  });
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]); // State for states for the dropdown
  const [countries, setCountries] = useState([]); // State for countries for the dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // To store the ID of the city being edited

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

  // Fetch states for the dropdown (initially, or based on selected country if needed later)
   const fetchStates = () => {
    axios.get(`${API_URL}/states/`)
      .then(response => {
        setStates(response.data);
      })
      .catch(err => {
        console.error('Error fetching states:', err);
      });
  };

  // Fetch cities for the list
  const fetchCities = () => {
    setLoading(true);
    axios.get(`${API_URL}/cities/`)
      .then(response => {
        setCities(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cities:', err);
        setError('Failed to fetch cities.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCountries(); // Fetch countries when component mounts
    fetchStates(); // Fetch states when component mounts
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (activeTab === 'list') {
      fetchCities(); // Fetch cities when switching to list tab
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveCity = (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.cityName || !formData.cityCode || !formData.state || !formData.country || !formData.status) {
      toast.error('Please fill in all required fields (City Name, City Code, State, Country, Status).');
      return;
    }

    if (editingId) {
      axios.post(`${API_URL}/cities/update/${editingId}`, formData)
        .then(res => {
          console.log(res.data);
          toast.success('City updated successfully!');
          setEditingId(null);
          setFormData({
            cityName: '',
            cityCode: '',
            state: '',
            country: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error updating city:', err);
          toast.error('Failed to update city.' + err.message);
        });
    } else {
      axios.post(`${API_URL}/cities/add`, formData)
        .then(res => {
          console.log(res.data);
          toast.success('City added successfully!');
          setFormData({
            cityName: '',
            cityCode: '',
            state: '',
            country: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error saving city:', err);
          toast.error('Failed to save city.' + err.message);
        });
    }
  };

  // Placeholder functions for edit and delete (will implement backend calls later)
   const handleEditCity = (city) => {
    setEditingId(city._id);
    setFormData({
      cityName: city.cityName,
      cityCode: city.cityCode,
      state: city.state._id, // Set state ID for editing
      country: city.country._id, // Set country ID for editing
      remarks: city.remarks,
      status: city.status
    });
    setActiveTab('add'); // Switch to add tab for editing
  };

  const handleDeleteCity = (id) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      axios.delete(`${API_URL}/cities/delete/${id}`)
        .then(res => {
          console.log(res.data);
          toast.success('City deleted successfully!');
          fetchCities();
        })
        .catch(err => {
          console.error('Error deleting city:', err);
          toast.error('Failed to delete city.' + err.message);
        });
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <form onSubmit={handleSaveCity} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="cityName">City Name*</label>
            <input
              type="text"
              id="cityName"
              name="cityName"
              value={formData.cityName}
              onChange={handleInputChange}
              placeholder="Enter city name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cityCode">City Code*</label>
            <input
              type="text"
              id="cityCode"
              name="cityCode"
              value={formData.cityCode}
              onChange={handleInputChange}
              placeholder="Enter city code"
              required
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
            <label htmlFor="state">State*</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select State -</option>
              {/* Filter states based on selected country if needed */}
              {states.map(state => (
                <option key={state._id} value={state._id}>{state.stateName}</option>
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
            <FaSave className="btn-icon" /> {editingId ? 'Update City' : 'Save City'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({
                cityName: '',
                cityCode: '',
                state: '',
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
        <div className="table-title">City List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search cities..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>City Name</th>
              <th>City Code</th>
              <th>State</th>
              <th>Country</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center text-danger">{error}</td>
              </tr>
            ) : cities.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No cities found</td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city._id}>
                  <td>{city.cityName}</td>
                  <td>{city.cityCode}</td>
                  <td>{city.state ? city.state.stateName : 'N/A'}</td>
                  <td>{city.country ? city.country.countryName : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${city.status}`}>
                      {city.status}
                    </span>
                  </td>
                  <td>{city.remarks}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEditCity(city)}><FaEdit /></button>
                      <button className="btn-icon" title="Delete" onClick={() => handleDeleteCity(city._id)}><FaTrash /></button>
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
        <h2>City Master</h2>
        <p className="page-description">Manage city information</p>
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
          <FaList className="btn-icon" /> City List
        </button>
      </div>

      {activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default CityMaster; 