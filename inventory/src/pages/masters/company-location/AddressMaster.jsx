import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
// import './AddressMaster.css'; // Assuming a CSS file might be needed

const API_URL = 'http://localhost:5000/api';

const AddressMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    telephone: '',
    mobile: '',
    fax: '',
    email: '',
    remarks: '',
    status: 'active'
  });

  const [addresses, setAddresses] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch initial data (addresses and countries)
  useEffect(() => {
    fetchAddresses();
    fetchCountries();
  }, []);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/addresses/`);
      setAddresses(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching addresses: ' + err.message);
    } finally {
      setLoading(false);
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
    } else {
      setCities([]); // Clear cities if no state is selected
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

  const handleSaveAddress = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.addressLine1 || !formData.country || !formData.state || !formData.city) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingId) {
      axios.post(`${API_URL}/addresses/update/${editingId}`, formData)
        .then(res => {
          console.log(res.data);
          alert('Address updated successfully!');
          setEditingId(null);
          setFormData({
            addressLine1: '',
            addressLine2: '',
            country: '',
            state: '',
            city: '',
            pincode: '',
            telephone: '',
            mobile: '',
            fax: '',
            email: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error updating address:', err);
          alert('Failed to update address.' + err.message);
        });
    } else {
      axios.post(`${API_URL}/addresses/add`, formData)
        .then(res => {
          console.log(res.data);
          alert('Address added successfully!');
          setFormData({
            addressLine1: '',
            addressLine2: '',
            country: '',
            state: '',
            city: '',
            pincode: '',
            telephone: '',
            mobile: '',
            fax: '',
            email: '',
            remarks: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error saving address:', err);
          alert('Failed to save address.' + err.message);
        });
    }
  };

  const handleEdit = (address) => {
    setFormData({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      country: address.country._id,
      state: address.state._id,
      city: address.city._id,
      pincode: address.pincode,
      telephone: address.telephone,
      mobile: address.mobile,
      fax: address.fax,
      email: address.email,
      remarks: address.remarks,
      status: address.status
    });
    setEditingId(address._id);
    setActiveTab('add'); // Switch to the Add New tab for editing
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      axios.delete(`${API_URL}/addresses/delete/${id}`)
        .then(res => {
          console.log(res.data);
          alert('Address deleted successfully!');
          fetchAddresses();
        })
        .catch(err => {
          console.error('Error deleting address:', err);
          alert('Failed to delete address.' + err.message);
        });
    }
  };

  const renderAddForm = () => (
    <div className="card">
       <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
      <form onSubmit={handleSaveAddress} className="form-container">
        <div className="form-grid">
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
                <option key={country._id} value={country._id}>
                  {country.countryName}
                </option>
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
              {states.map(state => (
                <option key={state._id} value={state._id}>
                  {state.stateName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="city">City*</label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">- Select City -</option>
              {cities.map(city => (
                <option key={city._id} value={city._id}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode*</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Enter pincode"
              required
              className="form-control"
            />
          </div>

           <div className="form-group">
            <label htmlFor="telephone">Telephone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="Enter telephone number"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fax">Fax</label>
            <input
              type="text"
              id="fax"
              name="fax"
              value={formData.fax}
              onChange={handleInputChange}
              placeholder="Enter fax number"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
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
            <FaSave className="btn-icon" /> {editingId ? 'Update' : 'Save'} Address
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Addresses List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search addresses..."
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
                <th>Address Line 1</th>
                <th>Address Line 2</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Pincode</th>
                <th>Contact No</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map(address => (
                <tr key={address._id}>
                  <td>{address.addressLine1}</td>
                  <td>{address.addressLine2}</td>
                  <td>{address.city ? address.city.cityName : 'N/A'}</td>
                  <td>{address.state ? address.state.stateName : 'N/A'}</td>
                  <td>{address.country ? address.country.countryName : 'N/A'}</td>
                  <td>{address.pincode}</td>
                  <td>{address.mobile} {address.telephone}</td>
                  <td>{address.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(address)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteAddress(address._id)}
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
        <h2>Address Master</h2>
        <p className="page-description">Manage your company addresses</p>
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

export default AddressMaster; 