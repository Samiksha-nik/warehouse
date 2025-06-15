import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaPlusCircle, FaList } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const SupplierMaster = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    // Supplier Details
    supplierName: '',
    alias: '',
    referenceBy: '',
    creditLimit: '',
    creditDays: '',
    assignedUser: '', // Dropdown

    // Billing Address Details
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    area: '',
    country: '', // Changed to store ID
    state: '', // Changed to store ID
    city: '', // Changed to store ID
    pinCode: '',
    kmFromFactory: '',
    telephoneNo: '',
    emailId: '',
    website: '',
    latitude: '',
    longitude: '',

    // Statutory Details
    gstinNo: '',
    pan: '',
    tan: '',

    // Bank Details
    bankNameAddress: '',
    bankAccountNo: '',
    accountType: '', // Dropdown
    rtgsIfscCode: '',
    micrCode: '',
    remarks: '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country) {
      console.log('Country changed to:', formData.country);
      // Reset state and city when country changes
      setFormData(prev => ({
        ...prev,
        state: '',
        city: ''
      }));
      fetchStates(formData.country);
    } else {
      console.log('No country selected, clearing states and cities');
      setStates([]);
      setCities([]);
      setFormData(prev => ({
        ...prev,
        state: '',
        city: ''
      }));
    }
  }, [formData.country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state) {
      console.log('State changed to:', formData.state);
      // Reset city when state changes
      setFormData(prev => ({
        ...prev,
        city: ''
      }));
      fetchCities(formData.state);
    } else {
      console.log('No state selected, clearing cities');
      setCities([]);
      setFormData(prev => ({
        ...prev,
        city: ''
      }));
    }
  }, [formData.state]);

  // Fetch suppliers when component mounts or when activeTab changes to 'list'
  useEffect(() => {
    if (activeTab === 'list') {
      fetchSuppliers();
    }
  }, [activeTab]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      setError(null);
      const response = await axios.get(`${API_URL}/countries/`);
      console.log('Countries API Response:', response);
      if (!response.data) {
        console.error('No data received from countries API');
        setError('No countries data received from server');
        setCountries([]);
        return;
      }
      const countriesData = Array.isArray(response.data) ? response.data : response.data.countries;
      setCountries(countriesData || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Error fetching countries: ' + (err.response?.data?.message || err.message));
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      setLoadingStates(true);
      setError(null);
      console.log('Fetching states for country:', countryId);
      
      if (!countryId) {
        console.error('No country ID provided');
        setError('Please select a country first');
        setStates([]);
        return;
      }

      const response = await axios.get(`${API_URL}/states/country/${countryId}`);
      console.log('Full states API Response:', response);
      console.log('States response data:', response.data);
      console.log('States response status:', response.status);

      // Check if response exists
      if (!response) {
        console.error('No response received from states API');
        setError('No response received from server');
        setStates([]);
        return;
      }

      // Check if response.data exists
      if (!response.data) {
        console.error('No data in states API response');
        setError('No data received from server');
        setStates([]);
        return;
      }

      // Handle different response structures
      let statesData;
      if (Array.isArray(response.data)) {
        statesData = response.data;
      } else if (response.data.states && Array.isArray(response.data.states)) {
        statesData = response.data.states;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        statesData = response.data.data;
      } else {
        console.error('Unexpected states data structure:', response.data);
        setError('Invalid data structure received from server');
        setStates([]);
        return;
      }

      console.log('Processed states data:', statesData);
      
      if (!statesData || statesData.length === 0) {
        console.log('No states found for country:', countryId);
        setError('No states found for selected country');
        setStates([]);
        return;
      }

      setStates(statesData);
    } catch (err) {
      console.error('Error fetching states:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Error fetching states: ${errorMessage}`);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      setLoadingCities(true);
      setError(null);
      console.log('Fetching cities for state:', stateId);

      if (!stateId) {
        console.error('No state ID provided');
        setError('Please select a state first');
        setCities([]);
        return;
      }

      const response = await axios.get(`${API_URL}/cities/state/${stateId}`);
      console.log('Full cities API Response:', response);
      console.log('Cities response data:', response.data);
      console.log('Cities response status:', response.status);

      // Check if response exists
      if (!response) {
        console.error('No response received from cities API');
        setError('No response received from server');
        setCities([]);
        return;
      }

      // Check if response.data exists
      if (!response.data) {
        console.error('No data in cities API response');
        setError('No data received from server');
        setCities([]);
        return;
      }

      // Handle different response structures
      let citiesData;
      if (Array.isArray(response.data)) {
        citiesData = response.data;
      } else if (response.data.cities && Array.isArray(response.data.cities)) {
        citiesData = response.data.cities;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        citiesData = response.data.data;
      } else {
        console.error('Unexpected cities data structure:', response.data);
        setError('Invalid data structure received from server');
        setCities([]);
        return;
      }

      console.log('Processed cities data:', citiesData);
      
      if (!citiesData || citiesData.length === 0) {
        console.log('No cities found for state:', stateId);
        setError('No cities found for selected state');
        setCities([]);
        return;
      }

      setCities(citiesData);
    } catch (err) {
      console.error('Error fetching cities:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Error fetching cities: ${errorMessage}`);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      setError(null);
      const response = await axios.get(`${API_URL}/suppliers/`);
      console.log('Suppliers API Response:', response);
      if (response.data) {
        setSuppliers(response.data);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Error fetching suppliers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSuppliers(false);
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
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.supplierName) {
        setError('Supplier name is required');
        return;
      }
      if (!formData.country) {
        setError('Country is required');
        return;
      }
      if (!formData.state) {
        setError('State is required');
        return;
      }
      if (!formData.city) {
        setError('City is required');
        return;
      }
      if (!formData.emailId) {
        setError('Email is required');
        return;
      }
      if (!formData.telephoneNo) {
        setError('Phone number is required');
        return;
      }
      if (!formData.gstinNo) {
        setError('GSTIN is required');
        return;
      }
      if (!formData.pan) {
        setError('PAN number is required');
        return;
      }
      if (!formData.bankAccountNo) {
        setError('Bank account number is required');
        return;
      }
      if (!formData.bankNameAddress) {
        setError('Bank name is required');
        return;
      }
      if (!formData.rtgsIfscCode) {
        setError('IFSC code is required');
        return;
      }

      // Generate a unique supplier code (you might want to implement your own logic)
      const supplierCode = `SUP${Date.now().toString().slice(-6)}`;

      // Format the data according to backend schema
      const supplierData = {
        supplierCode,
        supplierName: formData.supplierName,
        contactPerson: formData.referenceBy || formData.supplierName,
        email: formData.emailId,
        phone: formData.telephoneNo,
        address: {
          street: formData.addressLine1 || '',
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pinCode || ''
        },
        gstin: formData.gstinNo,
        panNumber: formData.pan,
        bankDetails: {
          accountNumber: formData.bankAccountNo,
          bankName: formData.bankNameAddress,
          ifscCode: formData.rtgsIfscCode,
          branchName: formData.area || 'Main Branch'
        },
        status: 'active'
      };

      console.log('Submitting supplier data:', supplierData);

      let response;
      if (editingId) {
        // Update existing supplier
        response = await axios.put(`${API_URL}/suppliers/update/${editingId}`, supplierData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        toast.success('Supplier updated successfully!');
      } else {
        // Create new supplier
        response = await axios.post(`${API_URL}/suppliers/add`, supplierData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        toast.success('Supplier added successfully!');
      }
      
      if (response.data) {
        // Reset form
        setFormData({
          supplierName: '',
          alias: '',
          referenceBy: '',
          creditLimit: '',
          creditDays: '',
          assignedUser: '',
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          area: '',
          country: '',
          state: '',
          city: '',
          pinCode: '',
          kmFromFactory: '',
          telephoneNo: '',
          emailId: '',
          website: '',
          latitude: '',
          longitude: '',
          gstinNo: '',
          pan: '',
          tan: '',
          bankNameAddress: '',
          bankAccountNo: '',
          accountType: '',
          rtgsIfscCode: '',
          micrCode: '',
          remarks: '',
        });
        setEditingId(null); // Clear editing state
        // Switch to list view and refresh the list
        setActiveTab('list');
        fetchSuppliers();
      } else {
        throw new Error('No response data received from server');
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 400) {
        const errorMessage = err.response.data?.message || 'Invalid data provided';
        setError(`Validation error: ${errorMessage}`);
      } else {
        const errorMessage = err.response?.data?.message || err.message;
        setError(`Error saving supplier: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/suppliers/get/${id}`);
      if (response.data) {
        // Map the supplier data to form data
        const supplier = response.data;
        setFormData({
          supplierName: supplier.supplierName,
          alias: supplier.alias || '',
          referenceBy: supplier.contactPerson,
          creditLimit: supplier.creditLimit || '',
          creditDays: supplier.creditDays || '',
          assignedUser: supplier.assignedUser || '',
          addressLine1: supplier.address?.street || '',
          addressLine2: '',
          addressLine3: '',
          area: supplier.bankDetails?.branchName || '',
          country: supplier.address?.country,
          state: supplier.address?.state,
          city: supplier.address?.city,
          pinCode: supplier.address?.pincode || '',
          kmFromFactory: '',
          telephoneNo: supplier.phone,
          emailId: supplier.email,
          website: '',
          latitude: '',
          longitude: '',
          gstinNo: supplier.gstin,
          pan: supplier.panNumber,
          tan: '',
          bankNameAddress: supplier.bankDetails?.bankName || '',
          bankAccountNo: supplier.bankDetails?.accountNumber || '',
          accountType: '',
          rtgsIfscCode: supplier.bankDetails?.ifscCode || '',
          micrCode: '',
          remarks: '',
        });
        setEditingId(id);
        setActiveTab('add');
      }
    } catch (err) {
      console.error('Error fetching supplier:', err);
      setError('Error fetching supplier: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${API_URL}/suppliers/delete/${id}`);
        toast.success('Supplier deleted successfully!');
        fetchSuppliers(); // Refresh the list
      } catch (err) {
        console.error('Error deleting supplier:', err);
        setError('Error deleting supplier: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
      {/* Supplier Details Block */}
      <div className="card-header">Supplier Details</div>
      <div className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="supplierName">Supplier Name*</label>
              <input 
                type="text" 
                id="supplierName" 
                name="supplierName" 
                value={formData.supplierName} 
                onChange={handleChange} 
                placeholder="Enter supplier name" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="alias">Alias</label>
              <input 
                type="text" 
                id="alias" 
                name="alias" 
                value={formData.alias} 
                onChange={handleChange} 
                placeholder="Enter alias" 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="referenceBy">Reference By</label>
              <input 
                type="text" 
                id="referenceBy" 
                name="referenceBy" 
                value={formData.referenceBy} 
                onChange={handleChange} 
                placeholder="Enter reference" 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="creditLimit">Credit Limit</label>
              <input 
                type="number" 
                id="creditLimit" 
                name="creditLimit" 
                value={formData.creditLimit} 
                onChange={handleChange} 
                placeholder="Enter credit limit" 
                className="form-control" 
                min="0" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="creditDays">Credit Days</label>
              <input 
                type="number" 
                id="creditDays" 
                name="creditDays" 
                value={formData.creditDays} 
                onChange={handleChange} 
                placeholder="Enter credit days" 
                className="form-control" 
                min="0" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="assignedUser">Assigned User</label>
              <select 
                id="assignedUser" 
                name="assignedUser" 
                value={formData.assignedUser} 
                onChange={handleChange} 
                className="form-control"
              >
              <option value="">Select User</option>
              {/* User options */}
            </select>
          </div>
        </div>
      </div>

      {/* Billing Address Details Block */}
      <div className="card-header">Billing Address Details</div>
      <div className="form-container">
        <div className="form-grid">
          <div className="form-group">
              <label htmlFor="addressLine1">Address Line 1*</label>
              <input 
                type="text" 
                id="addressLine1" 
                name="addressLine1" 
                value={formData.addressLine1} 
                onChange={handleChange} 
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
                onChange={handleChange} 
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
                onChange={handleChange} 
                placeholder="Enter address line 3" 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="area">Area</label>
              <input 
                type="text" 
                id="area" 
                name="area" 
                value={formData.area} 
                onChange={handleChange} 
                placeholder="Enter area" 
                className="form-control" 
              />
          </div>
          <div className="form-group">
              <label htmlFor="country">Country*</label>
              <select 
                id="country" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                required 
                className="form-control"
                disabled={loadingCountries}
              >
              <option value="">Select Country</option>
                {countries && countries.map(country => (
                  <option key={country._id} value={country._id}>
                    {country.countryName}
                  </option>
                ))}
            </select>
              {loadingCountries && <small className="text-muted">Loading countries...</small>}
          </div>
          <div className="form-group">
              <label htmlFor="state">State*</label>
              <select 
                id="state" 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                required 
                className="form-control" 
                disabled={!formData.country || loadingStates}
              >
              <option value="">Select State</option>
                {states && states.map(state => (
                  <option key={state._id} value={state._id}>
                    {state.stateName}
                  </option>
                ))}
            </select>
              {loadingStates && <small className="text-muted">Loading states...</small>}
          </div>
          <div className="form-group">
              <label htmlFor="city">City*</label>
              <select 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
                className="form-control" 
                disabled={!formData.state || loadingCities}
              >
              <option value="">Select City</option>
                {cities && cities.map(city => (
                  <option key={city._id} value={city._id}>
                    {city.cityName}
                  </option>
                ))}
            </select>
              {loadingCities && <small className="text-muted">Loading cities...</small>}
          </div>
          <div className="form-group">
              <label htmlFor="pinCode">Pin Code*</label>
              <input 
                type="text" 
                id="pinCode" 
                name="pinCode" 
                value={formData.pinCode} 
                onChange={handleChange} 
                placeholder="Enter pin code" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="kmFromFactory">K.M. From Factory</label>
              <input 
                type="number" 
                id="kmFromFactory" 
                name="kmFromFactory" 
                value={formData.kmFromFactory} 
                onChange={handleChange} 
                placeholder="Enter KM from factory" 
                className="form-control" 
                min="0" 
              />
          </div>
          <div className="form-group">
              <label htmlFor="telephoneNo">Telephone No*</label>
              <input 
                type="tel" 
                id="telephoneNo" 
                name="telephoneNo" 
                value={formData.telephoneNo} 
                onChange={handleChange} 
                placeholder="Enter telephone number" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
              <label htmlFor="emailId">Email ID*</label>
              <input 
                type="email" 
                id="emailId" 
                name="emailId" 
                value={formData.emailId} 
                onChange={handleChange} 
                placeholder="Enter email ID" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="website">Website</label>
              <input 
                type="url" 
                id="website" 
                name="website" 
                value={formData.website} 
                onChange={handleChange} 
                placeholder="Enter website URL" 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
              <input 
                type="text" 
                id="latitude" 
                name="latitude" 
                value={formData.latitude} 
                onChange={handleChange} 
                placeholder="Enter latitude" 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
              <input 
                type="text" 
                id="longitude" 
                name="longitude" 
                value={formData.longitude} 
                onChange={handleChange} 
                placeholder="Enter longitude" 
                className="form-control" 
              />
          </div>
        </div>
      </div>

      {/* Statutory Details Block */}
      <div className="card-header">Statutory Details</div>
      <div className="form-container">
        <div className="form-grid">
          <div className="form-group">
              <label htmlFor="gstinNo">GSTIN No*</label>
              <input 
                type="text" 
                id="gstinNo" 
                name="gstinNo" 
                value={formData.gstinNo} 
                onChange={handleChange} 
                placeholder="Enter GSTIN number" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
              <label htmlFor="pan">PAN*</label>
              <input 
                type="text" 
                id="pan" 
                name="pan" 
                value={formData.pan} 
                onChange={handleChange} 
                placeholder="Enter PAN" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="tan">TAN</label>
              <input 
                type="text" 
                id="tan" 
                name="tan" 
                value={formData.tan} 
                onChange={handleChange} 
                placeholder="Enter TAN" 
                className="form-control" 
              />
          </div>
        </div>
      </div>

      {/* Bank Details Block */}
      <div className="card-header">Bank Details</div>
      <div className="form-container">
        <div className="form-grid">
          <div className="form-group full-width">
              <label htmlFor="bankNameAddress">Name and Address of Bank*</label>
              <textarea 
                id="bankNameAddress" 
                name="bankNameAddress" 
                value={formData.bankNameAddress} 
                onChange={handleChange} 
                placeholder="Enter bank name and address" 
                required 
                className="form-control" 
                rows="2" 
              />
          </div>
          <div className="form-group">
              <label htmlFor="bankAccountNo">Bank A/C No*</label>
              <input 
                type="text" 
                id="bankAccountNo" 
                name="bankAccountNo" 
                value={formData.bankAccountNo} 
                onChange={handleChange} 
                placeholder="Enter bank account number" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="accountType">Type of A/c</label>
              <select 
                id="accountType" 
                name="accountType" 
                value={formData.accountType} 
                onChange={handleChange} 
                className="form-control"
              >
              <option value="">Select Account Type</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="fixed">Fixed Deposit</option>
            </select>
          </div>
          <div className="form-group">
              <label htmlFor="rtgsIfscCode">RTGS/IFSC Code*</label>
              <input 
                type="text" 
                id="rtgsIfscCode" 
                name="rtgsIfscCode" 
                value={formData.rtgsIfscCode} 
                onChange={handleChange} 
                placeholder="Enter RTGS/IFSC code" 
                required 
                className="form-control" 
              />
          </div>
          <div className="form-group">
            <label htmlFor="micrCode">MICR Code</label>
              <input 
                type="text" 
                id="micrCode" 
                name="micrCode" 
                value={formData.micrCode} 
                onChange={handleChange} 
                placeholder="Enter MICR code" 
                className="form-control" 
              />
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
                rows="2" 
              />
          </div>
        </div>
      </div>

      <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            <FaSave className="btn-icon" /> {loading ? 'Saving...' : 'Save'}
        </button>
          <button type="button" className="btn-secondary" onClick={() => setActiveTab('list')}>
            <FaTimes className="btn-icon" /> Cancel
        </button>
      </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
      <div className="table-header">
        <div className="table-title">Supplier List</div>
        <div className="table-actions">
          <button className="btn-primary" onClick={() => setActiveTab('add')}>
            <FaPlus className="btn-icon" /> Add New
          </button>
        </div>
      </div>
      <div className="table-container">
        {error && <p className="error">{error}</p>}
        {loadingSuppliers ? (
          <p>Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p>No suppliers found</p>
        ) : (
        <table className="data-table">
          <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {suppliers.map(supplier => (
                <tr key={supplier._id}>
                  <td>{supplier.supplierCode}</td>
                  <td>{supplier.supplierName}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>
                    <span className={`status-badge ${supplier.status}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEdit(supplier._id)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDelete(supplier._id)}
                      title="Delete"
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
        <h2>Supplier Master</h2>
        <p className="page-description">Manage your suppliers</p>
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

export default SupplierMaster; 