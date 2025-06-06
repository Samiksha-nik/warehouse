import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaTags, FaBox, FaExchangeAlt, FaTruck,
  FaBuilding, FaUsers, FaBoxes, FaChevronDown, FaChevronRight,
  FaGlobe, FaMapMarkerAlt, FaCity, FaIndustry, FaWarehouse, FaAddressCard,
  FaUserFriends, FaUserTie, FaTruckLoading,
  FaBoxOpen, FaLayerGroup,
  FaRuler, FaStar, FaMedal, FaBarcode, FaUndo
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    companyLocation: false,
    account: false,
    inventory: false,
    productManagement: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Inventory</h2>
      </div>
      <nav className="sidebar-nav">
        {/* Master Pages Section */}
        <div className="master-sections">
          <h3 className="master-section-title">Master Pages</h3>
          
          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('companyLocation')}>
              <span><FaBuilding /> Company & Location</span>
              {expandedSections.companyLocation ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {expandedSections.companyLocation && (
              <div className="master-subsection">
                <Link to="/masters/company-location/country" className={`nav-item ${isActive('/masters/company-location/country') ? 'active' : ''}`}>
                  <FaGlobe /> Country Master
                </Link>
                <Link to="/masters/company-location/state" className={`nav-item ${isActive('/masters/company-location/state') ? 'active' : ''}`}>
                  <FaMapMarkerAlt /> State Master
                </Link>
                <Link to="/masters/company-location/city" className={`nav-item ${isActive('/masters/company-location/city') ? 'active' : ''}`}>
                  <FaCity /> City Master
                </Link>
                <Link to="/masters/company-location/company" className={`nav-item ${isActive('/masters/company-location/company') ? 'active' : ''}`}>
                  <FaIndustry /> Company Master
                </Link>
                <Link to="/masters/company-location/location" className={`nav-item ${isActive('/masters/company-location/location') ? 'active' : ''}`}>
                  <FaWarehouse /> Location Master
                </Link>
                <Link to="/masters/company-location/address" className={`nav-item ${isActive('/masters/company-location/address') ? 'active' : ''}`}>
                  <FaAddressCard /> Address Master
                </Link>
              </div>
            )}
          </div>

          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('account')}>
              <span><FaUsers /> Account Management</span>
              {expandedSections.account ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {expandedSections.account && (
              <div className="master-subsection">
                <Link to="/masters/account-management/customer" className={`nav-item ${isActive('/masters/account-management/customer') ? 'active' : ''}`}>
                  <FaUserTie /> Customer Master
                </Link>
                <Link to="/masters/account-management/supplier" className={`nav-item ${isActive('/masters/account-management/supplier') ? 'active' : ''}`}>
                  <FaTruckLoading /> Supplier Master
                </Link>
              </div>
            )}
          </div>

          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('inventory')}>
              <span><FaBoxes /> Inventory Management</span>
              {expandedSections.inventory ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {expandedSections.inventory && (
              <div className="master-subsection">
                <Link to="/masters/inventory-management/unit" className={`nav-item ${isActive('/masters/inventory-management/unit') ? 'active' : ''}`}>
                  <FaRuler /> Unit Master
                </Link>
                <Link to="/masters/inventory-management/grade" className={`nav-item ${isActive('/masters/inventory-management/grade') ? 'active' : ''}`}>
                  <FaMedal /> Grade Master
                </Link>
                <Link to="/masters/inventory-management/hsn" className={`nav-item ${isActive('/masters/inventory-management/hsn') ? 'active' : ''}`}>
                  <FaBarcode /> HSN Master
                </Link>
                <Link to="/masters/inventory-management/category" className={`nav-item ${isActive('/masters/inventory-management/category') ? 'active' : ''}`}>
                  <FaTags /> Category Master
                </Link>
                
                <Link to="/masters/inventory-management/sub-category" className={`nav-item ${isActive('/masters/inventory-management/sub-category') ? 'active' : ''}`}>
                  <FaLayerGroup /> Sub Category Master
                </Link>

                <div className="master-section-header nested" onClick={() => toggleSection('productManagement')}>
                  <span><FaBoxOpen /> Product Management</span>
                  {expandedSections.productManagement ? <FaChevronDown /> : <FaChevronRight />}
                </div>
                {expandedSections.productManagement && (
                  <div className="master-subsection nested">
                    <Link to="/masters/inventory-management/product-management/product" className={`nav-item ${isActive('/masters/inventory-management/product-management/product') ? 'active' : ''}`}>
                      <FaBoxOpen /> Product Master
                    </Link>
                    <Link to="/masters/inventory-management/product-management/product-online" className={`nav-item ${isActive('/masters/inventory-management/product-management/product-online') ? 'active' : ''}`}>
                      <FaBoxOpen /> Product Master (Online)
                    </Link>
                    <Link to="/masters/inventory-management/product-management/raw-material" className={`nav-item ${isActive('/masters/inventory-management/product-management/raw-material') ? 'active' : ''}`}>
                      <FaLayerGroup /> Raw Material Master
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="main-nav-section">
          <h3 className="master-section-title">Operations</h3>
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <FaHome /> <span>Dashboard</span>
          </Link>
          <Link to="/label-generator" className={`nav-item ${isActive('/label-generator') ? 'active' : ''}`}>
            <FaTags /> <span>Manual Generate Label</span>
          </Link>
          <Link to="/assign-inventory" className={`nav-item ${isActive('/assign-inventory') ? 'active' : ''}`}>
            <FaBox /> <span>Assign Inventory</span>
          </Link>
          <Link to="/stock-transfer" className={`nav-item ${isActive('/stock-transfer') ? 'active' : ''}`}>
            <FaExchangeAlt /> <span>Stock Transfer</span>
          </Link>
          <Link to="/dispatch" className={`nav-item ${isActive('/dispatch') ? 'active' : ''}`}>
            <FaTruck /> <span>Dispatch</span>
          </Link>
          <Link to="/operations/return-refund" className={`nav-item ${isActive('/operations/return-refund') ? 'active' : ''}`}>
            <FaUndo /> <span>Return & Refund</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
