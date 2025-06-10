import React, { useState } from 'react';
import { FaUser, FaSignOutAlt, FaBuilding } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Select Company');

  const companies = [
    'BOUJEE BALANCEE PRIVATE LIMITED',
  ];

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setIsCompanyDropdownOpen(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout clicked');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-actions">
          <div className="company-selector">
            <button 
              className="company-button"
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            >
              <FaBuilding className="icon" />
              <span>{selectedCompany}</span>
            </button>
            
            {isCompanyDropdownOpen && (
              <div className="company-dropdown">
                {companies.map((company) => (
                  <button
                    key={company}
                    className="company-option"
                    onClick={() => handleCompanySelect(company)}
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <FaUser className="icon" />
            <span>Logout</span>
            <FaSignOutAlt className="icon" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 