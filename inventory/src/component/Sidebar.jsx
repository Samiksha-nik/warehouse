import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaTags, FaBox, FaExchangeAlt, FaTruck,
  FaBuilding, FaUsers, FaBoxes, FaChevronDown, FaChevronRight,
  FaGlobe, FaMapMarkerAlt, FaCity, FaIndustry, FaWarehouse, FaAddressCard,
  FaUserFriends, FaUserTie, FaTruckLoading,
  FaBoxOpen, FaLayerGroup,
  FaRuler, FaStar, FaMedal, FaBarcode, FaUndo,
  FaAngleDoubleLeft, FaAngleDoubleRight, FaChartLine, FaTag, FaTachometerAlt,
  FaShoppingCart, FaClipboardCheck
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    companyLocation: false,
    account: false,
    inventoryMaster: false,
    productManagement: false,
    inventoryOperations: false,
    orderManagement: false
  });
  const [collapsed, setCollapsed] = useState(true);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>Inventory</h2>}
        <button className="sidebar-toggle-btn" onClick={handleCollapse}>
          {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {/* Dashboard */}
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <FaTachometerAlt className="nav-icon" /> {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Master Pages Section */}
        <div className="master-sections">
          {!collapsed && <h3 className="master-section-title">Master Pages</h3>}
          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('companyLocation')}>
              <span><FaBuilding /> {!collapsed && 'Company & Location'}</span>
              {!collapsed && (expandedSections.companyLocation ? <FaChevronDown /> : <FaChevronRight />)}
            </div>
            {expandedSections.companyLocation && !collapsed && (
              <div className="master-subsection">
                <Link to="/masters/company-location/country" className={`nav-item ${isActive('/masters/company-location/country') ? 'active' : ''}`}><FaGlobe /> {!collapsed && 'Country Master'}</Link>
                <Link to="/masters/company-location/state" className={`nav-item ${isActive('/masters/company-location/state') ? 'active' : ''}`}><FaMapMarkerAlt /> {!collapsed && 'State Master'}</Link>
                <Link to="/masters/company-location/city" className={`nav-item ${isActive('/masters/company-location/city') ? 'active' : ''}`}><FaCity /> {!collapsed && 'City Master'}</Link>
                <Link to="/masters/company-location/company" className={`nav-item ${isActive('/masters/company-location/company') ? 'active' : ''}`}><FaIndustry /> {!collapsed && 'Company Master'}</Link>
                <Link to="/masters/company-location/location" className={`nav-item ${isActive('/masters/company-location/location') ? 'active' : ''}`}><FaWarehouse /> {!collapsed && 'Location Master'}</Link>
                <Link to="/masters/company-location/address" className={`nav-item ${isActive('/masters/company-location/address') ? 'active' : ''}`}><FaAddressCard /> {!collapsed && 'Address Master'}</Link>
              </div>
            )}
          </div>
          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('account')}>
              <span><FaUsers /> {!collapsed && 'Account Management'}</span>
              {!collapsed && (expandedSections.account ? <FaChevronDown /> : <FaChevronRight />)}
            </div>
            {expandedSections.account && !collapsed && (
              <div className="master-subsection">
                <Link to="/masters/account-management/customer" className={`nav-item ${isActive('/masters/account-management/customer') ? 'active' : ''}`}><FaUserTie /> {!collapsed && 'Customer Master'}</Link>
                <Link to="/masters/account-management/supplier" className={`nav-item ${isActive('/masters/account-management/supplier') ? 'active' : ''}`}><FaTruckLoading /> {!collapsed && 'Supplier Master'}</Link>
              </div>
            )}
          </div>
          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('inventoryMaster')}>
              <span><FaBoxes /> {!collapsed && 'Inventory Management'}</span>
              {!collapsed && (expandedSections.inventoryMaster ? <FaChevronDown /> : <FaChevronRight />)}
            </div>
            {expandedSections.inventoryMaster && !collapsed && (
              <div className="master-subsection">
                <Link to="/masters/inventory-management/unit" className={`nav-item ${isActive('/masters/inventory-management/unit') ? 'active' : ''}`}><FaRuler /> {!collapsed && 'Unit Master'}</Link>
                <Link to="/masters/inventory-management/grade" className={`nav-item ${isActive('/masters/inventory-management/grade') ? 'active' : ''}`}><FaMedal /> {!collapsed && 'Grade Master'}</Link>
                <Link to="/masters/inventory-management/hsn" className={`nav-item ${isActive('/masters/inventory-management/hsn') ? 'active' : ''}`}><FaBarcode /> {!collapsed && 'HSN Master'}</Link>
                <Link to="/masters/inventory-management/category" className={`nav-item ${isActive('/masters/inventory-management/category') ? 'active' : ''}`}><FaTags /> {!collapsed && 'Category Master'}</Link>
                <Link to="/masters/inventory-management/sub-category" className={`nav-item ${isActive('/masters/inventory-management/sub-category') ? 'active' : ''}`}><FaLayerGroup /> {!collapsed && 'Sub Category Master'}</Link>
                <div className="master-section-header nested" onClick={() => toggleSection('productManagement')}>
                  <span><FaBoxOpen /> {!collapsed && 'Product Management'}</span>
                  {!collapsed && (expandedSections.productManagement ? <FaChevronDown /> : <FaChevronRight />)}
                </div>
                {expandedSections.productManagement && !collapsed && (
                  <div className="master-subsection nested">
                    <Link to="/masters/inventory-management/product-management/product" className={`nav-item ${isActive('/masters/inventory-management/product-management/product') ? 'active' : ''}`}><FaBoxOpen /> {!collapsed && 'Product Master'}</Link>
                    <Link to="/masters/inventory-management/product-management/product-online" className={`nav-item ${isActive('/masters/inventory-management/product-management/product-online') ? 'active' : ''}`}><FaBoxOpen /> {!collapsed && 'Product Master (Online)'}</Link>
                    <Link to="/masters/inventory-management/product-management/raw-material" className={`nav-item ${isActive('/masters/inventory-management/product-management/raw-material') ? 'active' : ''}`}><FaLayerGroup /> {!collapsed && 'Raw Material Master'}</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Operations Section */}
        <div className="master-sections">
          {!collapsed && <h3 className="master-section-title">Operations</h3>}
          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('inventoryOperations')}>
              <span><FaBoxes /> {!collapsed && 'Inventory'}</span>
              {!collapsed && (expandedSections.inventoryOperations ? <FaChevronDown /> : <FaChevronRight />)}
            </div>
            {expandedSections.inventoryOperations && !collapsed && (
              <div className="master-subsection">
                <Link to="/label" className={`nav-item ${isActive('/label') ? 'active' : ''}`}><FaTags /> {!collapsed && 'Label'}</Link>
                <Link to="/assign-inventory" className={`nav-item ${isActive('/assign-inventory') ? 'active' : ''}`}><FaBox /> {!collapsed && 'Assign Inventory'}</Link>
                <Link to="/stock-transfer" className={`nav-item ${isActive('/stock-transfer') ? 'active' : ''}`}><FaExchangeAlt /> {!collapsed && 'Stock Transfer'}</Link>
                <Link to="/dispatch" className={`nav-item ${isActive('/dispatch') ? 'active' : ''}`}><FaTruck /> {!collapsed && 'Dispatch'}</Link>
                <Link to="/return-refund" className={`nav-item ${isActive('/return-refund') ? 'active' : ''}`}><FaUndo /> {!collapsed && 'Return & Refund'}</Link>
              </div>
            )}
          </div>

          {/* Order Management Section */}
          <div className="master-section">
            <div className="master-section-header" onClick={() => toggleSection('orderManagement')}>
              <span><FaShoppingCart /> {!collapsed && 'Order Management'}</span>
              {!collapsed && (expandedSections.orderManagement ? <FaChevronDown /> : <FaChevronRight />)}
            </div>
            {expandedSections.orderManagement && !collapsed && (
              <div className="master-subsection">
                <Link to="/order" className={`nav-item ${isActive('/order') ? 'active' : ''}`}><FaShoppingCart /> {!collapsed && 'Order'}</Link>
                <Link to="/order-approval" className={`nav-item ${isActive('/order-approval') ? 'active' : ''}`}><FaClipboardCheck /> {!collapsed && 'Order Approval'}</Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Reports Section */}
        <div className="master-sections">
          {!collapsed && <h3 className="master-section-title">Reports</h3>}
          <div className="master-section">
            <div className="master-subsection">
              <Link to="/reports/stock-report" className={`nav-item ${isActive('/reports/stock-report') ? 'active' : ''}`}><FaChartLine /> {!collapsed && 'Stock Report'}</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
