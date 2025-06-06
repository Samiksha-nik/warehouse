import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaPlusCircle, FaList } from 'react-icons/fa';
// import './CustomerMaster.css'; // Assuming a CSS file might be needed

const CustomerMaster = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    // Customer Details
    customerCode: '',
    customerName: '',
    contactPerson: '',
    phoneNumber: '',
    mobileNumber: '',
    email: '',
    website: '',
    referenceBy: '',
    creditLimit: '',
    creditDays: '',
    printAddressOnLabel: 'no',
    assignedUser: '',
    modifySP: 'no',
    salesPersonName: '',

    // Billing Address Details
    billingAddress: {
      _id: '',
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
    },

    // Statutory Details
    gstin: '',
    pan: '',
    tan: '',

    // Bank Details
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
    remarks: '',
    status: 'active',
    accountType: ''
  });

  const [customers, setCustomers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch initial data (customers, countries)
  useEffect(() => {
    fetchCustomers();
    fetchCountries();
  }, []);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/customers/');
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/countries/');
      setCountries(response.data);
    } catch (err) {
      setError('Error fetching countries: ' + err.message);
    }
  };

  // Fetch states when country changes in billing address
  useEffect(() => {
    if (formData.billingAddress.country) {
      fetchStates(formData.billingAddress.country);
    } else {
      setStates([]); // Clear states if no country is selected
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.billingAddress, state: '', city: '' }
      }));
    }
  }, [formData.billingAddress.country]);

  // Fetch states
  const fetchStates = async (countryId) => {
    try {
      const response = await axios.get(`http://localhost:5000/states/country/${countryId}`);
      setStates(response.data);
    } catch (err) {
      setError('Error fetching states: ' + err.message);
    }
  };

  // Fetch cities when state changes in billing address
  useEffect(() => {
    if (formData.billingAddress.state) {
      fetchCities(formData.billingAddress.state);
    } else {
      setCities([]); // Clear cities if no state is selected
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.billingAddress, city: '' }
      }));
    }
  }, [formData.billingAddress.state]);

  // Fetch cities
  const fetchCities = async (stateId) => {
    try {
      const response = await axios.get(`http://localhost:5000/cities/state/${stateId}`);
      setCities(response.data);
    } catch (err) {
      setError('Error fetching cities: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'radio' ? value : (type === 'checkbox' ? checked : value);

    // Handle nested billingAddress fields
    if (name.startsWith('billingAddress.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [fieldName]: newValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      // Validate required customer fields
      if (!formData.customerCode || !formData.customerName) {
        alert('Please fill in all required fields (Customer Code and Customer Name).');
        return;
      }

      let savedAddressId = formData.billingAddress._id; // Keep existing address ID if editing

      // If billing address details are provided, save/update the Address document first
      const billingAddressProvided = formData.billingAddress.addressLine1 || 
                                   formData.billingAddress.country || 
                                   formData.billingAddress.state || 
                                   formData.billingAddress.city || 
                                   formData.billingAddress.pincode;

      if (billingAddressProvided) {
        // Client-side validation for required billing address fields
        const requiredFields = {
          addressLine1: 'Address Line 1',
          country: 'Country',
          state: 'State',
          city: 'City',
          pincode: 'Pincode'
        };

        const missingFields = Object.entries(requiredFields)
          .filter(([field]) => !formData.billingAddress[field])
          .map(([_, label]) => label);

        if (missingFields.length > 0) {
          alert(`Please fill in all required Billing Address fields: ${missingFields.join(', ')}`);
          return;
        }

        const addressData = {
          addressLine1: formData.billingAddress.addressLine1,
          addressLine2: formData.billingAddress.addressLine2 || '',
          country: formData.billingAddress.country,
          state: formData.billingAddress.state,
          city: formData.billingAddress.city,
          pincode: formData.billingAddress.pincode,
          telephone: formData.billingAddress.telephone || '',
          mobile: formData.billingAddress.mobile || '',
          fax: formData.billingAddress.fax || '',
          email: formData.billingAddress.email || '',
          remarks: formData.billingAddress.remarks || '',
          status: formData.billingAddress.status || 'active'
        };

        try {
          if (formData.billingAddress._id) {
            // Update existing address
            const addressResponse = await axios.post(`http://localhost:5000/addresses/update/${formData.billingAddress._id}`, addressData);
            savedAddressId = formData.billingAddress._id; // Use existing ID
          } else {
            // Create new address
            const addressResponse = await axios.post('http://localhost:5000/addresses/add', addressData);
            savedAddressId = addressResponse.data._id; // Get the new address ID from the response
          }
        } catch (addressErr) {
          console.error('Error saving address:', addressErr);
          alert('Error saving billing address: ' + (addressErr.response?.data?.message || addressErr.message));
          return;
        }
      } else if (formData.billingAddress._id) {
        // If no billing address details provided but an ID exists, unlink it
        savedAddressId = null;
      } else {
        savedAddressId = null; // No billing address details and no existing ID
      }

      const customerData = {
        customerCode: formData.customerCode.trim(),
        customerName: formData.customerName.trim(),
        contactPerson: formData.contactPerson?.trim() || '',
        phoneNumber: formData.phoneNumber?.trim() || '',
        mobileNumber: formData.mobileNumber?.trim() || '',
        email: formData.email?.trim() || '',
        website: formData.website?.trim() || '',
        referenceBy: formData.referenceBy?.trim() || '',
        creditLimit: formData.creditLimit || '',
        creditDays: formData.creditDays || '',
        printAddressOnLabel: formData.printAddressOnLabel || 'no',
        assignedUser: formData.assignedUser || '',
        modifySP: formData.modifySP || 'no',
        salesPersonName: formData.salesPersonName?.trim() || '',
        billingAddress: savedAddressId,
        gstin: formData.gstin?.trim() || '',
        pan: formData.pan?.trim() || '',
        tan: formData.tan?.trim() || '',
        bankName: formData.bankName?.trim() || '',
        branchName: formData.branchName?.trim() || '',
        accountNumber: formData.accountNumber?.trim() || '',
        ifscCode: formData.ifscCode?.trim() || '',
        remarks: formData.remarks?.trim() || '',
        status: formData.status || 'active',
        accountType: formData.accountType || ''
      };

      if (editingId) {
        await axios.post(`http://localhost:5000/customers/update/${editingId}`, customerData);
        alert('Customer updated successfully!');
      } else {
        await axios.post('http://localhost:5000/customers/add', customerData);
        alert('Customer added successfully!');
      }

      fetchCustomers();
      setFormData({
        // Reset form state
        customerCode: '',
        customerName: '',
        contactPerson: '',
        phoneNumber: '',
        mobileNumber: '',
        email: '',
        website: '',
        referenceBy: '',
        creditLimit: '',
        creditDays: '',
        printAddressOnLabel: 'no',
        assignedUser: '',
        modifySP: 'no',
        salesPersonName: '',
        billingAddress: {
          _id: '',
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
        },
        gstin: '',
        pan: '',
        tan: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        ifscCode: '',
        remarks: '',
        status: 'active',
        accountType: ''
      });
      setEditingId(null);
      setActiveTab('list'); // Switch to list view after saving
    } catch (err) {
      if (err.response?.data?.includes('duplicate key error')) {
        alert('Error: Customer Code already exists. Please use a different code.');
      } else {
        alert('Error: ' + (err.response?.data || err.message));
      }
      console.error('Error saving customer:', err);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      customerCode: customer.customerCode || '',
      customerName: customer.customerName || '',
      contactPerson: customer.contactPerson || '',
      phoneNumber: customer.phoneNumber || '',
      mobileNumber: customer.mobileNumber || '',
      email: customer.email || '',
      website: customer.website || '',
      referenceBy: customer.referenceBy || '',
      creditLimit: customer.creditLimit || '',
      creditDays: customer.creditDays || '',
      printAddressOnLabel: customer.printAddressOnLabel || 'no',
      assignedUser: customer.assignedUser || '',
      modifySP: customer.modifySP || 'no',
      salesPersonName: customer.salesPersonName || '',
      billingAddress: customer.billingAddress ? {
        _id: customer.billingAddress._id || '',
        addressLine1: customer.billingAddress.addressLine1 || '',
        addressLine2: customer.billingAddress.addressLine2 || '',
        country: customer.billingAddress.country?._id || '',
        state: customer.billingAddress.state?._id || '',
        city: customer.billingAddress.city?._id || '',
        pincode: customer.billingAddress.pincode || '',
        telephone: customer.billingAddress.telephone || '',
        mobile: customer.billingAddress.mobile || '',
        fax: customer.billingAddress.fax || '',
        email: customer.billingAddress.email || '',
        remarks: customer.billingAddress.remarks || '',
        status: customer.billingAddress.status || 'active'
      } : {
        _id: '',
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
      },
      gstin: customer.gstin || '',
      pan: customer.pan || '',
      tan: customer.tan || '',
      bankName: customer.bankName || '',
      branchName: customer.branchName || '',
      accountNumber: customer.accountNumber || '',
      ifscCode: customer.ifscCode || '',
      remarks: customer.remarks || '',
      status: customer.status || 'active',
      accountType: customer.accountType || ''
    });
    setEditingId(customer._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        // Optional: Delete the associated billing address as well
        const customerToDelete = customers.find(cust => cust._id === id);
        if (customerToDelete && customerToDelete.billingAddress) {
           // await axios.delete(`http://localhost:5000/addresses/delete/${customerToDelete.billingAddress._id}`);
           // Note: Deleting associated address is optional based on requirements.
           // The Customer document will still be deleted below.
        }
        await axios.delete(`http://localhost:5000/customers/delete/${id}`);
        alert('Customer deleted successfully!');
        fetchCustomers();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error deleting customer:', err);
      }
    }
  };


  const renderAddForm = () => (
    <div className="card">
      <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
      <form onSubmit={handleSaveCustomer} className="form-container">
        {/* Customer Details Block */}
        <div className="card-header">Customer Details</div>
        <div className="form-container">
          <div className="form-grid">
             <div className="form-group">
              <label htmlFor="customerCode">Customer Code*</label>
              <input type="text" id="customerCode" name="customerCode" value={formData.customerCode || ''} onChange={handleInputChange} placeholder="Enter customer code" required className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="customerName">Customer Name*</label>
              <input type="text" id="customerName" name="customerName" value={formData.customerName || ''} onChange={handleInputChange} placeholder="Enter customer name" required className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="contactPerson">Contact Person</label>
              <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} placeholder="Enter contact person name" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleInputChange} placeholder="Enter phone number" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleInputChange} placeholder="Enter mobile number" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="Enter email" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="website">Website</label>
              <input type="url" id="website" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="Enter website URL" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="referenceBy">Reference By</label>
              <input type="text" id="referenceBy" name="referenceBy" value={formData.referenceBy || ''} onChange={handleInputChange} placeholder="Enter reference" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="creditLimit">Credit Limit</label>
              <input type="number" id="creditLimit" name="creditLimit" value={formData.creditLimit || ''} onChange={handleInputChange} placeholder="Enter credit limit" className="form-control" min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="creditDays">Credit Days</label>
              <input type="number" id="creditDays" name="creditDays" value={formData.creditDays || ''} onChange={handleInputChange} placeholder="Enter credit days" className="form-control" min="0" />
            </div>

            <div className="form-group">
              <label>Print Address on Label*</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="printAddressOnLabel" value="yes" checked={formData.printAddressOnLabel === 'yes'} onChange={handleInputChange} required />
                  <span>Yes</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="printAddressOnLabel" value="no" checked={formData.printAddressOnLabel === 'no'} onChange={handleInputChange} required />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Assuming Users need to be fetched and populated */}
            <div className="form-group">
              <label htmlFor="assignedUser">Assigned User</label>
              <select id="assignedUser" name="assignedUser" value={formData.assignedUser || ''} onChange={handleInputChange} className="form-control">
                 <option value="">Select User</option>
                 {/* Map over fetched users */}
                 {/* {users.map(user => (<option key={user._id} value={user._id}>{user.userName}</option>))}*/}
               </select>
            </div>

            <div className="form-group">
              <label htmlFor="modifySP">Modify SP</label>
               <select id="modifySP" name="modifySP" value={formData.modifySP || 'no'} onChange={handleInputChange} className="form-control">
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
             <div className="form-group">
              <label htmlFor="salesPersonName">Sales Person Name</label>
              <input type="text" id="salesPersonName" name="salesPersonName" value={formData.salesPersonName || ''} onChange={handleInputChange} placeholder="Enter sales person name" className="form-control" />
            </div>

          </div>
        </div>

        {/* Billing Address Details Block */}
        <div className="card-header">Billing Address Details</div>
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="billingAddress.addressLine1">Address Line 1</label>
              <input type="text" id="billingAddress.addressLine1" name="billingAddress.addressLine1" value={formData.billingAddress.addressLine1 || ''} onChange={handleInputChange} placeholder="Enter address line 1" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="billingAddress.addressLine2">Address Line 2</label>
              <input type="text" id="billingAddress.addressLine2" name="billingAddress.addressLine2" value={formData.billingAddress.addressLine2 || ''} onChange={handleInputChange} placeholder="Enter address line 2" className="form-control" />
            </div>

             {/* Country Dropdown */}
            <div className="form-group">
              <label htmlFor="billingAddress.country">Country*</label>
              <select
                id="billingAddress.country"
                name="billingAddress.country"
                value={formData.billingAddress.country || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country._id} value={country._id}>
                    {country.countryName}
                  </option>
                ))}
              </select>
            </div>

            {/* State Dropdown */}
            <div className="form-group">
              <label htmlFor="billingAddress.state">State*</label>
              <select
                id="billingAddress.state"
                name="billingAddress.state"
                value={formData.billingAddress.state || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state._id} value={state._id}>
                    {state.stateName}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div className="form-group">
              <label htmlFor="billingAddress.city">City*</label>
              <select
                id="billingAddress.city"
                name="billingAddress.city"
                value={formData.billingAddress.city || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city._id} value={city._id}>
                    {city.cityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="billingAddress.pincode">Pincode</label>
              <input type="text" id="billingAddress.pincode" name="billingAddress.pincode" value={formData.billingAddress.pincode || ''} onChange={handleInputChange} placeholder="Enter pin code" className="form-control" />
            </div>

            <div className="form-group">
              <label htmlFor="billingAddress.telephone">Telephone No</label>
              <input type="tel" id="billingAddress.telephone" name="billingAddress.telephone" value={formData.billingAddress.telephone || ''} onChange={handleInputChange} placeholder="Enter telephone number" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="billingAddress.mobile">Mobile Number</label>
              <input type="tel" id="billingAddress.mobile" name="billingAddress.mobile" value={formData.billingAddress.mobile || ''} onChange={handleInputChange} placeholder="Enter mobile number" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="billingAddress.fax">Fax</label>
              <input type="text" id="billingAddress.fax" name="billingAddress.fax" value={formData.billingAddress.fax || ''} onChange={handleInputChange} placeholder="Enter fax number" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="billingAddress.email">Email ID</label>
              <input type="email" id="billingAddress.email" name="billingAddress.email" value={formData.billingAddress.email || ''} onChange={handleInputChange} placeholder="Enter email ID" className="form-control" />
            </div>
             <div className="form-group full-width">
              <label htmlFor="billingAddress.remarks">Remarks</label>
              <textarea
                id="billingAddress.remarks"
                name="billingAddress.remarks"
                value={formData.billingAddress.remarks || ''}
                onChange={handleInputChange}
                placeholder="Enter any additional remarks" rows="3" className="form-control" />
            </div>
          </div>
        </div>

        {/* Login Details Block - Assuming these are directly on Customer for now */}
         <div className="card-header">Login Details</div>
        <div className="form-container">
          <div className="form-grid">
            {/* User ID, Password, Status are likely on User model, not Customer. Keeping for now based on original form structure. */}
             <div className="form-group">
              <label htmlFor="userId">User ID*</label>
              {/* Consider linking Customer to User model if login is separate */}
              <input type="text" id="userId" name="userId" value={formData.userId || ''} onChange={handleInputChange} placeholder="Enter user ID" required className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password*</label>
              <input type="password" id="password" name="password" value={formData.password || ''} onChange={handleInputChange} placeholder="Enter password" required className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="status">Status*</label>
              <select id="status" name="status" value={formData.status || 'active'} onChange={handleInputChange} required className="form-control">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statutory Details Block */}
        <div className="card-header">Statutory Details</div>
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gstin">GSTIN No</label>
              <input type="text" id="gstin" name="gstin" value={formData.gstin || ''} onChange={handleInputChange} placeholder="Enter GSTIN number" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="pan">PAN</label>
              <input type="text" id="pan" name="pan" value={formData.pan || ''} onChange={handleInputChange} placeholder="Enter PAN" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="tan">TAN</label>
              <input type="text" id="tan" name="tan" value={formData.tan || ''} onChange={handleInputChange} placeholder="Enter TAN" className="form-control" />
            </div>
          </div>
        </div>

        {/* Bank Details Block */}
        <div className="card-header">Bank Details</div>
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <input type="text" id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} placeholder="Enter bank name" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="branchName">Branch Name</label>
              <input type="text" id="branchName" name="branchName" value={formData.branchName || ''} onChange={handleInputChange} placeholder="Enter branch name" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input type="text" id="accountNumber" name="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} placeholder="Enter account number" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="ifscCode">IFSC Code</label>
              <input type="text" id="ifscCode" name="ifscCode" value={formData.ifscCode || ''} onChange={handleInputChange} placeholder="Enter IFSC code" className="form-control" />
            </div>
             <div className="form-group">
              <label htmlFor="accountType">Account Type</label>
              <select id="accountType" name="accountType" value={formData.accountType || ''} onChange={handleInputChange} className="form-control">
                <option value="">Select Account Type</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                 {/* Add other account types as needed */}
               </select>
            </div>
             <div className="form-group full-width">
              <label htmlFor="remarks">Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks || ''}
                onChange={handleInputChange}
                placeholder="Enter any additional remarks" rows="3" className="form-control" />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <FaSave className="btn-icon" /> {editingId ? 'Update' : 'Save'} Customer
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card">
       <div className="table-header">
        <div className="table-title">Customers List</div>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search customers..."
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
                <th>Customer Code</th>
                <th>Customer Name</th>
                <th>Contact Person</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Billing Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>{customer.customerCode}</td>
                  <td>{customer.customerName}</td>
                  <td>{customer.contactPerson}</td>
                  <td>{customer.mobileNumber}</td>
                  <td>{customer.email}</td>
                  <td>
                    {customer.billingAddress ? 
                      `${customer.billingAddress.addressLine1 || ''} ${customer.billingAddress.city ? customer.billingAddress.city.cityName : 'N/A'}, ${customer.billingAddress.state ? customer.billingAddress.state.stateName : 'N/A'}, ${customer.billingAddress.country ? customer.billingAddress.country.countryName : 'N/A'}`
                      : 'N/A'
                    }
                  </td>
                  <td>{customer.status}</td>
                  <td>
                    <button onClick={() => handleEdit(customer)} className="btn-icon">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(customer._id)} className="btn-icon">
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
        <h2>Customer Master</h2>
        <p className="page-description">Manage your customer information</p>
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

export default CustomerMaster; 