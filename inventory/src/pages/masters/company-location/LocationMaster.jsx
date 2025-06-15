import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import './LocationMaster.css';

const API_URL = 'http://localhost:5000/api';

const LocationMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    locationName: '',
    locationCode: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    countryName: '',
    stateName: '',
    cityName: '',
    pinCode: '',
    mobileNo: '',
    telephoneNo: '',
    emailId: '',
    status: 'active',
    remark: '',
    company: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    fax: '',
    gstinNo: '',
    pan: '',
    companyName: '',
    companyCode: '',
    telephone: '',
    mobile: '',
    email: '',
    remarks: ''
  });

  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchLocations();
    fetchCompanies();
    fetchCountries();
  }, []);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/locations/`);
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching locations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies/`);
      setCompanies(response.data);
    } catch (err) {
      setError('Error fetching companies: ' + err.message);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${API_URL}/countries/`);
      setCountries(response.data);
    } catch (err) {
      setError('Error fetching countries: ' + err.message);
    }
  };

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    }
  }, [formData.country]);

  // Fetch states
  const fetchStates = async (countryId) => {
    try {
      const response = await axios.get(`${API_URL}/states/country/${countryId}`);
      setStates(response.data);
    } catch (err) {
      setError('Error fetching states: ' + err.message);
    }
  };

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state) {
      fetchCities(formData.state);
    }
  }, [formData.state]);

  // Fetch cities
  const fetchCities = async (stateId) => {
    try {
      const response = await axios.get(`${API_URL}/cities/state/${stateId}`);
      setCities(response.data);
    } catch (err) {
      setError('Error fetching cities: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.locationName || !formData.locationCode || !formData.company || 
        !formData.country || !formData.state || !formData.city) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (editingId) {
      axios.post(`${API_URL}/locations/update/${editingId}`, formData)
        .then(res => {
          console.log(res.data);
          toast.success('Location updated successfully!');
          setEditingId(null);
          setFormData({
            locationName: '',
            locationCode: '',
            company: '',
            country: '',
            state: '',
            city: '',
            pincode: '',
            telephone: '',
            mobile: '',
            email: '',
            gstinNo: '',
            pan: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error updating location:', err);
          toast.error('Failed to update location.' + err.message);
        });
    } else {
      axios.post(`${API_URL}/locations/add`, formData)
        .then(res => {
          console.log(res.data);
          toast.success('Location added successfully!');
          setFormData({
            locationName: '',
            locationCode: '',
            company: '',
            country: '',
            state: '',
            city: '',
            pincode: '',
            telephone: '',
            mobile: '',
            email: '',
            gstinNo: '',
            pan: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error saving location:', err);
          toast.error('Failed to save location.' + err.message);
        });
    }
  };

  const handleEdit = (location) => {
    setFormData({
      locationCode: location.locationCode,
      locationName: location.locationName,
      addressLine1: location.addressLine1,
      addressLine2: location.addressLine2,
      status: location.status,
      company: location.company._id,
      country: location.country._id,
      state: location.state._id,
      city: location.city._id,
      pincode: location.pincode,
      fax: location.fax,
      gstinNo: location.gstinNo,
      pan: location.pan,
      telephone: location.telephone,
      mobile: location.mobile,
      email: location.email,
      remarks: location.remarks
    });
    setEditingId(location._id);
    setActiveTab('add');
  };

  const handleDeleteLocation = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      axios.delete(`${API_URL}/locations/delete/${id}`)
        .then(res => {
          console.log(res.data);
          toast.success('Location deleted successfully!');
          fetchLocations();
        })
        .catch(err => {
          console.error('Error deleting location:', err);
          toast.error('Failed to delete location.' + err.message);
        });
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Location' : 'Add New Location'}</h2>
      <form onSubmit={handleSaveLocation} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="locationName">Location Name*</label>
            <input
              type="text"
              id="locationName"
              name="locationName"
              value={formData.locationName}
              onChange={handleInputChange}
              placeholder="Enter location name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationCode">Location Code*</label>
            <input
              type="text"
              id="locationCode"
              name="locationCode"
              value={formData.locationCode}
              onChange={handleInputChange}
              placeholder="Enter location code"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="addressLine1">Address Line 1*</label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="Enter address line 1"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="addressLine2">Address Line 2</label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Enter address line 2"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="addressLine3">Address Line 3</label>
            <input
              type="text"
              id="addressLine3"
              name="addressLine3"
              value={formData.addressLine3}
              onChange={handleInputChange}
              placeholder="Enter address line 3"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="countryName">Country Name*</label>
            <select
              id="countryName"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select -</option>
              {countries.map(country => (
                <option key={country._id} value={country._id}>
                  {country.countryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="stateName">State Name*</label>
            <select
              id="stateName"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select -</option>
              {states.map(state => (
                <option key={state._id} value={state._id}>
                  {state.stateName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cityName">City Name*</label>
            <select
              id="cityName"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select -</option>
              {cities.map(city => (
                <option key={city._id} value={city._id}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pinCode">Pin Code*</label>
            <input
              type="text"
              id="pinCode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Enter pin code"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNo">Mobile No*</label>
            <input
              type="tel"
              id="mobileNo"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephoneNo">Telephone No</label>
            <input
              type="tel"
              id="telephoneNo"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="Enter telephone number"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emailId">Email ID*</label>
            <input
              type="email"
              id="emailId"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email ID"
              required
              className="form-control"
            />
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
            <label htmlFor="remark">Remark</label>
            <textarea
              id="remark"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Enter any additional remarks"
              rows="3"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company*</label>
            <select
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select -</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.companyName} ({company.companyCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gstinNo">GSTIN No</label>
            <input
              type="text"
              id="gstinNo"
              name="gstinNo"
              value={formData.gstinNo}
              onChange={handleInputChange}
              placeholder="Enter GSTIN No"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pan">PAN</label>
            <input
              type="text"
              id="pan"
              name="pan"
              value={formData.pan}
              onChange={handleInputChange}
              placeholder="Enter PAN"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> {editingId ? 'Update' : 'Save'} Location
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Locations List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search locations..."
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
                <th>Location Code</th>
                <th>Location Name</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Contact No</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(location => (
                <tr key={location._id}>
                  <td>{location.locationCode}</td>
                  <td>{location.locationName}</td>
                  <td>{location.addressLine1} {location.addressLine2} {location.addressLine3}</td>
                  <td>{location.city.cityName}</td>
                  <td>{location.state.stateName}</td>
                  <td>{location.country.countryName}</td>
                  <td>{location.mobile} {location.telephone}</td>
                  <td>{location.status}</td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(location)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteLocation(location._id)}
                    >
                      <FaTrash />
                    </button>
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
        <h2>Location Master</h2>
        <p className="page-description">Manage your company locations</p>
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

export default LocationMaster; 