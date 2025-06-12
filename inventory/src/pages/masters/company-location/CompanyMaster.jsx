import React, { useState, useEffect } from 'react';
import '../../../styles/shared.css';
import { FaPlusCircle, FaList, FaSave, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const CompanyMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
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
    gstinNo: '',
    pan: '',
    remarks: '',
    defaultLocation: '',
    status: 'active'
  });
  const [companies, setCompanies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch countries for dropdown
  const fetchCountries = () => {
    axios.get('http://localhost:5000/api/countries/')
      .then(response => {
        setCountries(response.data);
      })
      .catch(err => {
        console.error('Error fetching countries:', err);
      });
  };

  // Fetch states for dropdown
  const fetchStates = () => {
    axios.get('http://localhost:5000/api/states/')
      .then(response => {
        setStates(response.data);
      })
      .catch(err => {
        console.error('Error fetching states:', err);
      });
  };

  // Fetch cities for dropdown
  const fetchCities = () => {
    axios.get('http://localhost:5000/api/cities/')
      .then(response => {
        setCities(response.data);
      })
      .catch(err => {
        console.error('Error fetching cities:', err);
      });
  };

  // Fetch companies for list
  const fetchCompanies = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/companies/')
      .then(response => {
        setCompanies(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching companies:', err);
        setError('Failed to fetch companies.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCountries();
    fetchStates();
    fetchCities();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchCompanies();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.companyCode || !formData.companyName || !formData.addressLine1 || 
        !formData.country || !formData.state || !formData.city || !formData.pincode) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingId) {
      axios.post(`http://localhost:5000/api/companies/update/${editingId}`, formData)
        .then(res => {
          console.log(res.data);
          alert('Company updated successfully!');
          setEditingId(null);
          setFormData({
            companyCode: '',
            companyName: '',
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
            gstinNo: '',
            pan: '',
            remarks: '',
            defaultLocation: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error updating company:', err);
          alert('Failed to update company.' + err.message);
        });
    } else {
      axios.post('http://localhost:5000/api/companies/add', formData)
        .then(res => {
          console.log(res.data);
          alert('Company added successfully!');
          setFormData({
            companyCode: '',
            companyName: '',
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
            gstinNo: '',
            pan: '',
            remarks: '',
            defaultLocation: '',
            status: 'active'
          });
          setActiveTab('list');
        })
        .catch(err => {
          console.error('Error saving company:', err);
          alert('Failed to save company.' + err.message);
        });
    }
  };

  const handleEditCompany = (company) => {
    setEditingId(company._id);
    setFormData({
      companyCode: company.companyCode,
      companyName: company.companyName,
      addressLine1: company.addressLine1,
      addressLine2: company.addressLine2,
      country: company.country._id,
      state: company.state._id,
      city: company.city._id,
      pincode: company.pincode,
      telephone: company.telephone,
      mobile: company.mobile,
      fax: company.fax,
      email: company.email,
      gstinNo: company.gstinNo,
      pan: company.pan,
      remarks: company.remarks,
      defaultLocation: company.defaultLocation,
      status: company.status
    });
    setActiveTab('add');
  };

  const handleDeleteCompany = (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      axios.delete(`http://localhost:5000/api/companies/delete/${id}`)
        .then(res => {
          console.log(res.data);
          alert('Company deleted successfully!');
          fetchCompanies();
        })
        .catch(err => {
          console.error('Error deleting company:', err);
          alert('Failed to delete company.' + err.message);
        });
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <form onSubmit={handleSaveCompany} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="companyCode">Company Code*</label>
            <input
              type="text"
              id="companyCode"
              name="companyCode"
              value={formData.companyCode}
              onChange={handleInputChange}
              placeholder="Enter company code"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name*</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required
              className="form-control"
            />
          </div>

          <div className="form-group full-width">
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

          <div className="form-group full-width">
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
              {states.map(state => (
                <option key={state._id} value={state._id}>{state.stateName}</option>
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
                <option key={city._id} value={city._id}>{city.cityName}</option>
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
              type="text"
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
              type="text"
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
            <label htmlFor="gstinNo">GSTIN No</label>
            <input
              type="text"
              id="gstinNo"
              name="gstinNo"
              value={formData.gstinNo}
              onChange={handleInputChange}
              placeholder="Enter GSTIN number"
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
              placeholder="Enter PAN number"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultLocation">Default Location</label>
            <input
              type="text"
              id="defaultLocation"
              name="defaultLocation"
              value={formData.defaultLocation}
              onChange={handleInputChange}
              placeholder="Enter default location"
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
            <FaSave className="btn-icon" /> {editingId ? 'Update Company' : 'Save Company'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({
                companyCode: '',
                companyName: '',
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
                gstinNo: '',
                pan: '',
                remarks: '',
                defaultLocation: '',
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
        <div className="table-title">Company List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search companies..."
            className="form-control search-input"
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company Code</th>
              <th>Company Name</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="text-center text-danger">{error}</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">No companies found</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id}>
                  <td>{company.companyCode}</td>
                  <td>{company.companyName}</td>
                  <td>{company.addressLine1}</td>
                  <td>{company.city ? company.city.cityName : 'N/A'}</td>
                  <td>{company.state ? company.state.stateName : 'N/A'}</td>
                  <td>{company.country ? company.country.countryName : 'N/A'}</td>
                  <td>{company.telephone || company.mobile || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${company.status}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEditCompany(company)}><FaEdit /></button>
                      <button className="btn-icon" title="Delete" onClick={() => handleDeleteCompany(company._id)}><FaTrash /></button>
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
        <h2>Company Master</h2>
        <p className="page-description">Manage company information</p>
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
          <FaList className="btn-icon" /> Company List
        </button>
      </div>

      {activeTab === 'add' ? renderAddForm() : renderList()}
    </div>
  );
};

export default CompanyMaster; 