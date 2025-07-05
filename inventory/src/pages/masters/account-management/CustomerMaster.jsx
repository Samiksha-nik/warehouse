import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/shared.css';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaPlusCircle, FaList, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
// import './CustomerMaster.css'; // Assuming a CSS file might be needed

const API_URL = 'http://localhost:5000/api';

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
      addressLine3: '',
      area: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      kmFromFactory: '',
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

  const [categoryLinks, setCategoryLinks] = useState([
    { category: '', product: '', unit: '', grade: '', basicRate: '', lastUpdatedDate: '', warranty: '', materialDescription: '', bundleQty: '' }
  ]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressModalCustomer, setAddressModalCustomer] = useState(null);
  const [addressType, setAddressType] = useState('Billing');
  const [addressModalTab, setAddressModalTab] = useState('add');
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [viewAddressModalOpen, setViewAddressModalOpen] = useState(false);
  const [viewAddressData, setViewAddressData] = useState(null);

  const [addressList, setAddressList] = useState([]);

  // Fetch initial data (customers, countries)
  useEffect(() => {
    fetchCustomers();
    fetchCountries();
    axios.get(`${API_URL}/categories/`).then(res => setCategoryOptions(res.data)).catch(() => setCategoryOptions([]));
    axios.get(`${API_URL}/products/`).then(res => setProductOptions(res.data)).catch(() => setProductOptions([]));
    axios.get(`${API_URL}/units/`).then(res => setUnitOptions(res.data)).catch(() => setUnitOptions([]));
    axios.get(`${API_URL}/grades/`).then(res => setGradeOptions(res.data)).catch(() => setGradeOptions([]));
  }, []);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/customers/`);
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
      const response = await axios.get(`${API_URL}/countries/`);
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
      const response = await axios.get(`${API_URL}/states/country/${countryId}`);
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
      const response = await axios.get(`${API_URL}/cities/state/${stateId}`);
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
        toast.error('Please fill in all required fields (Customer Code and Customer Name).');
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
          toast.error(`Please fill in all required Billing Address fields: ${missingFields.join(', ')}`);
          return;
        }

        const addressData = {
          addressLine1: formData.billingAddress.addressLine1,
          addressLine2: formData.billingAddress.addressLine2 || '',
          addressLine3: formData.billingAddress.addressLine3 || '',
          area: formData.billingAddress.area || '',
          country: formData.billingAddress.country,
          state: formData.billingAddress.state,
          city: formData.billingAddress.city,
          kmFromFactory: formData.billingAddress.kmFromFactory || '',
          telephone: formData.billingAddress.telephone || '',
          mobile: formData.billingAddress.mobile || '',
          fax: formData.billingAddress.fax || '',
          email: formData.billingAddress.email || '',
          remarks: formData.billingAddress.remarks || '',
          status: formData.billingAddress.status || 'active',
          pincode: formData.billingAddress.pincode || ''
        };

        try {
          if (formData.billingAddress._id) {
            await axios.put(`${API_URL}/addresses/update/${formData.billingAddress._id}`, addressData);
            savedAddressId = formData.billingAddress._id; // Use existing ID
          } else {
            // Create new address
            console.log("Address data being sent:", addressData);
            const requiredFields = [
              'addressLine1', 'country', 'state', 'city', 'pincode', 'status'
            ];
            for (let field of requiredFields) {
              if (!addressData[field] || addressData[field].toString().trim() === '') {
                toast.error(`Please fill the required field: ${field}`);
                return;
              }
            }
            const addressResponse = await axios.post(`${API_URL}/addresses/add`, addressData);
            savedAddressId = addressResponse.data._id; // Get the new address ID from the response
          }
        } catch (addressErr) {
          console.error('Error saving address:', addressErr);
          toast.error('Error saving billing address: ' + (addressErr.response?.data?.message || addressErr.message));
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
        await axios.post(`${API_URL}/customers/update/${editingId}`, customerData);
        toast.success('Customer updated successfully!');
      } else {
        await axios.post(`${API_URL}/customers/add`, customerData);
        toast.success('Customer added successfully!');
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
          addressLine3: '',
          area: '',
          country: '',
          state: '',
          city: '',
          pincode: '',
          kmFromFactory: '',
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
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      if (typeof errorMsg === 'string' && errorMsg.includes('duplicate key error')) {
        toast.error('Error: Customer Code already exists. Please use a different code.');
      } else {
        toast.error('Error: ' + errorMsg);
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
        addressLine3: customer.billingAddress.addressLine3 || '',
        area: customer.billingAddress.area || '',
        country: customer.billingAddress.country?._id || '',
        state: customer.billingAddress.state?._id || '',
        city: customer.billingAddress.city?._id || '',
        kmFromFactory: customer.billingAddress.kmFromFactory || '',
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
        addressLine3: '',
        area: '',
        country: '',
        state: '',
        city: '',
        kmFromFactory: '',
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
        await axios.delete(`${API_URL}/customers/delete/${id}`);
        toast.success('Customer deleted successfully!');
        fetchCustomers();
      } catch (err) {
        toast.error('Error: ' + err.message);
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleCategoryLinkChange = (idx, field, value) => {
    setCategoryLinks(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddCategoryLink = (idx) => {
    // Only add a new row if the current row is filled
    const row = categoryLinks[idx];
    if (row.category && row.product && row.unit && row.grade && row.basicRate && row.lastUpdatedDate) {
      setCategoryLinks(prev => [...prev, { category: '', product: '', unit: '', grade: '', basicRate: '', lastUpdatedDate: '', warranty: '', materialDescription: '', bundleQty: '' }]);
    } else {
      toast.error('Please fill all required fields in this row before adding a new one.');
    }
  };

  const openAddressModal = async (customer) => {
    setAddressModalCustomer(customer);
    setAddressType('Billing');
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setAddressModalCustomer(null);
  };

  const handleSaveAddress = () => {
    // Remove _id if present to avoid duplicate key error
    const { _id, ...addressDataWithoutId } = addressModalCustomer?.billingAddress || {};
    const addressData = {
      ...addressDataWithoutId,
      customerName: addressModalCustomer?.customerName || ''
    };
    axios.post('http://localhost:5000/api/addresses/add', addressData)
      .then(() => {
        setAddressModalTab('list');
        toast.success('Address saved!');
      })
      .catch(err => {
        toast.error('Error saving address: ' + (err.response?.data?.message || err.message));
      });
  };

  // Fetch addresses from backend when Address Master modal is opened and List tab is active
  useEffect(() => {
    if (addressModalOpen && addressModalTab === 'list' && addressModalCustomer?.customerName) {
      axios.get('http://localhost:5000/api/addresses/')
        .then(res => {
          // Only show addresses with the current customer name
          const filtered = res.data.filter(addr => addr.customerName === addressModalCustomer.customerName);
          setAddressList(filtered);
        })
        .catch(() => setAddressList([]));
    }
  }, [addressModalOpen, addressModalTab, addressModalCustomer]);

  // Add this function to handle address deletion
  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`http://localhost:5000/api/addresses/delete/${id}`);
        toast.success('Address deleted successfully!');
        // Refresh the address list
        axios.get('http://localhost:5000/api/addresses/')
          .then(res => setAddressList(res.data))
          .catch(() => setAddressList([]));
      } catch (err) {
        toast.error('Error deleting address: ' + (err.response?.data?.message || err.message));
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
              <label htmlFor="billingAddress.addressLine1">Address Line 1*</label>
              <input type="text" id="billingAddress.addressLine1" name="billingAddress.addressLine1" value={formData.billingAddress.addressLine1 || ''} onChange={handleInputChange} placeholder="Enter address line 1" required className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="billingAddress.addressLine2">Address Line 2</label>
              <input type="text" id="billingAddress.addressLine2" name="billingAddress.addressLine2" value={formData.billingAddress.addressLine2 || ''} onChange={handleInputChange} placeholder="Enter address line 2" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="billingAddress.addressLine3">Address Line 3</label>
              <input type="text" id="billingAddress.addressLine3" name="billingAddress.addressLine3" value={formData.billingAddress.addressLine3 || ''} onChange={handleInputChange} placeholder="Enter address line 3" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="billingAddress.area">Area</label>
              <input type="text" id="billingAddress.area" name="billingAddress.area" value={formData.billingAddress.area || ''} onChange={handleInputChange} placeholder="Enter area" className="form-control" />
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
            <div className="form-group">
              <label htmlFor="billingAddress.kmFromFactory">K.M. from factory*</label>
              <input type="text" id="billingAddress.kmFromFactory" name="billingAddress.kmFromFactory" value={formData.billingAddress.kmFromFactory || ''} onChange={handleInputChange} placeholder="Enter K.M. from factory" required className="form-control" />
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

            {/* Customer Category Linking Table */}
            <div className="form-group full-width">
              <a href="#" style={{ fontWeight: 'bold', color: '#2196f3', textDecoration: 'underline', fontSize: '1.1em' }}>Customer Category Linking</a>
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <table className="data-table" style={{ minWidth: 1200 }}>
                  <thead>
                    <tr style={{ background: '#ffe600', color: '#222', fontWeight: 'bold' }}>
                      <th>Sr. No.</th>
                      <th>Category Name *</th>
                      <th>Product *</th>
                      <th>Unit *</th>
                      <th>Grade *</th>
                      <th>Basic Rate (Per Unit) *</th>
                      <th>Last updated Date *</th>
                      <th>Warranty (In Year)</th>
                      <th>Material Description</th>
                      <th>Bundle Qty</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryLinks.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <select value={row.category || ''} onChange={e => handleCategoryLinkChange(idx, 'category', e.target.value)} required>
                            <option value="">Select</option>
                            {categoryOptions.map(cat => (
                              <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select value={row.product || ''} onChange={e => handleCategoryLinkChange(idx, 'product', e.target.value)} required>
                            <option value="">Select</option>
                            {productOptions.map(prod => (
                              <option key={prod._id} value={prod._id}>{prod.productName}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select value={row.unit || ''} onChange={e => handleCategoryLinkChange(idx, 'unit', e.target.value)} required>
                            <option value="">Select</option>
                            {unitOptions.map(unit => (
                              <option key={unit._id} value={unit._id}>{unit.unitName}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select value={row.grade || ''} onChange={e => handleCategoryLinkChange(idx, 'grade', e.target.value)} required>
                            <option value="">Select</option>
                            {gradeOptions.map(grade => (
                              <option key={grade._id} value={grade._id}>{grade.gradeName}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input type="number" value={row.basicRate || ''} onChange={e => handleCategoryLinkChange(idx, 'basicRate', e.target.value)} min="0" step="0.0001" required style={{ width: 90 }} />
                        </td>
                        <td>
                          <input type="date" value={row.lastUpdatedDate || ''} onChange={e => handleCategoryLinkChange(idx, 'lastUpdatedDate', e.target.value)} required style={{ width: 140 }} />
                        </td>
                        <td>
                          <input type="number" value={row.warranty || ''} onChange={e => handleCategoryLinkChange(idx, 'warranty', e.target.value)} min="0" style={{ width: 60 }} />
                        </td>
                        <td>
                          <textarea value={row.materialDescription || ''} onChange={e => handleCategoryLinkChange(idx, 'materialDescription', e.target.value)} style={{ width: 140 }} />
                        </td>
                        <td>
                          <input type="number" value={row.bundleQty || ''} onChange={e => handleCategoryLinkChange(idx, 'bundleQty', e.target.value)} min="0" style={{ width: 60 }} />
                        </td>
                        <td>
                          <button type="button" className="btn-primary" style={{ padding: '2px 10px', fontSize: 14 }} onClick={() => handleAddCategoryLink(idx)}>add</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                <th>Address</th>
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
                    <a href="#" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 500, fontSize: 18 }} onClick={e => { e.preventDefault(); openAddressModal(customer); }}>Address</a>
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
      <Modal
        isOpen={addressModalOpen}
        onRequestClose={closeAddressModal}
        contentLabel="Address Modal"
        style={{
          overlay: { zIndex: 1000, background: 'rgba(0,0,0,0.2)' },
          content: { maxWidth: 900, margin: 'auto', borderRadius: 8, padding: 0, border: '2px solid #0099cc' }
        }}
        ariaHideApp={false}
      >
        <div style={{ background: '#00a6d6', color: '#fff', padding: '10px 20px', fontWeight: 'bold', fontSize: 22, borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 1200 }}>
          <span>Address Master</span>
          <button onClick={closeAddressModal} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>&times;</button>
        </div>
        {/* Address Modal Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e0e0e0', background: '#f7f7f7' }}>
          <button
            style={{
              padding: '10px 32px',
              border: 'none',
              borderBottom: addressModalTab === 'add' ? '3px solid #00a6d6' : '3px solid transparent',
              background: 'none',
              fontWeight: 600,
              fontSize: 18,
              color: addressModalTab === 'add' ? '#00a6d6' : '#333',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-bottom 0.2s'
            }}
            onClick={() => setAddressModalTab('add')}
          >
            Add New
          </button>
          <button
            style={{
              padding: '10px 32px',
              border: 'none',
              borderBottom: addressModalTab === 'list' ? '3px solid #00a6d6' : '3px solid transparent',
              background: 'none',
              fontWeight: 600,
              fontSize: 18,
              color: addressModalTab === 'list' ? '#00a6d6' : '#333',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-bottom 0.2s'
            }}
            onClick={() => setAddressModalTab('list')}
          >
            List
          </button>
          <button
            onClick={closeAddressModal}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#00a6d6',
              fontSize: 28,
              cursor: 'pointer',
              padding: '0 16px',
              lineHeight: 1
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div style={{ padding: 24, background: '#fff' }}>
          {addressModalTab === 'add' && (
            <>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 18 }}>Address Type <span style={{ color: 'red' }}>*</span></label>
                <select value={addressType} onChange={e => setAddressType(e.target.value)} style={{ fontSize: 16, padding: '2px 8px' }}>
                  <option value="Billing">Billing</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              {addressType === 'Billing' && addressModalCustomer && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ fontWeight: 500 }}>Party Name</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.customerName || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Address Line 1</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.addressLine1 || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Address Line 2</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.addressLine2 || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Address Line 3</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.addressLine3 || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Area</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.area || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Country Name</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.country?.countryName || addressModalCustomer.billingAddress?.country || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>State Name</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.state?.stateName || addressModalCustomer.billingAddress?.state || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>City Name</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.city?.cityName || addressModalCustomer.billingAddress?.city || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Pin Code</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.pincode || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>K.M. from factory</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.kmFromFactory || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Telephone No.</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.telephone || ''}</div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500 }}>Email ID</label>
                    <div style={{ border: '1px solid #b2dfdb', borderRadius: 4, padding: 6, minHeight: 32 }}>{addressModalCustomer.billingAddress?.email || ''}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32 }}>
                <button type="button" className="btn-primary" style={{ minWidth: 100 }} onClick={handleSaveAddress}>Save</button>
                <button type="button" className="btn-secondary" style={{ minWidth: 100 }} onClick={closeAddressModal}>Close</button>
              </div>
            </>
          )}
          {addressModalTab === 'list' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Customer Name</th>
                    <th>Address</th>
                    <th>Created At</th>
                    <th>Modified At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {addressList.map((addr, idx) => (
                    <tr key={addr._id}>
                      <td>{idx + 1}</td>
                      <td>{addr.customerName}</td>
                      <td>{[addr.addressLine1, addr.addressLine2, addr.addressLine3].filter(Boolean).join(', ')}</td>
                      <td>{addr.createdAt ? new Date(addr.createdAt).toLocaleString() : ''}</td>
                      <td>{addr.updatedAt ? new Date(addr.updatedAt).toLocaleString() : ''}</td>
                      <td>
                        <button onClick={() => { setViewAddressData(addr); setViewAddressModalOpen(true); }} className="btn-icon"><FaEye /> View</button>
                        <button onClick={() => openAddressModal(addr)} className="btn-icon">Edit</button>
                        <button onClick={() => handleDeleteAddress(addr._id)} className="btn-icon">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
      {viewAddressModalOpen && viewAddressData && (
        <Modal
          isOpen={viewAddressModalOpen}
          onRequestClose={() => setViewAddressModalOpen(false)}
          contentLabel="View Address"
          style={{
            overlay: { zIndex: 1000, background: 'rgba(0,0,0,0.2)' },
            content: { maxWidth: 900, margin: 'auto', borderRadius: 8, padding: 0, border: '2px solid #0099cc' }
          }}
          ariaHideApp={false}
        >
          <div style={{ background: '#00a6d6', color: '#fff', padding: '10px 20px', fontWeight: 'bold', fontSize: 22, borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 800 }}>
            <span>Address Master - View</span>
            <button onClick={() => setViewAddressModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>&times;</button>
          </div>
          <div style={{ padding: 32, background: '#fff' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Address Type <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.addressType || 'Billing'}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Party Name</div>
                <div style={{ color: '#666', fontWeight: 600, fontSize: 18 }}>{viewAddressData.customerName || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Address Line 1 <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.addressLine1 || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Address Line 2</div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.addressLine2 || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Address Line 3</div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.addressLine3 || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Area <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.area || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Country Name <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.country?.countryName || viewAddressData.country || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>State Name <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.state?.stateName || viewAddressData.state || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>City Name <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.city?.cityName || viewAddressData.city || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Pin Code <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.pincode || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>K.M. from factory <span style={{ color: 'red' }}>*</span></div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.kmFromFactory || ''}</div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Telephone No.</div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.telephone || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 4 }}>Email ID</div>
                <div style={{ color: '#0033cc', fontWeight: 600, fontSize: 18 }}>{viewAddressData.email || ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <button type="button" className="btn-primary" style={{ minWidth: 100 }} onClick={() => {
                setViewAddressModalOpen(false);
                openAddressModal(viewAddressData);
              }}>Edit</button>
              <button type="button" className="btn-secondary" style={{ minWidth: 140 }} onClick={() => setViewAddressModalOpen(false)}>
                Back to List
              </button>
            </div>
          </div>
        </Modal>
      )}
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