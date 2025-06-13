import React, { useState, useEffect } from 'react';
import { FaUser, FaSignOutAlt, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('BOUJEE BALANCEE PRIVATE LIMITED');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const companies = [
    'BOUJEE BALANCEE PRIVATE LIMITED',
  ];

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setIsCompanyDropdownOpen(false);
  };

  const handleLogout = () => {
    navigate('/logout');
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

          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button className="logout-button" onClick={handleLogout}>
                <FaUser className="icon" />
                <span>Logout</span>
                <FaSignOutAlt className="icon" />
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={() => navigate('/login')}>
              <FaUser className="icon" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;