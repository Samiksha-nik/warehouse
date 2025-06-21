import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaBell, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/shared.css';

const LowStockNotification = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchLowStockItems();
    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/low-stock');
      setLowStockItems(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching low stock items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const badgeCount = lowStockItems.length;
  const bellClass = badgeCount > 0 ? 'notification-bell has-alert' : 'notification-bell all-good';

  return (
    <div className="low-stock-notification" ref={dropdownRef}>
      <button
        className={bellClass}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Low Stock Notifications"
      >
        <FaBell size={22} />
        {badgeCount > 0 && <span className="notification-badge">{badgeCount}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <FaExclamationTriangle className="dropdown-icon" />
            <span>Low Stock Alerts</span>
          </div>
          {loading ? (
            <div className="dropdown-loading">Loading...</div>
          ) : error ? (
            <div className="dropdown-error">{error}</div>
          ) : badgeCount === 0 ? (
            <div className="dropdown-empty">No low stock alerts.</div>
          ) : (
            <ul className="dropdown-list">
              {lowStockItems.map((item) => (
                <li key={item._id} className="dropdown-list-item">
                  <div className="item-main">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-qty">{item.quantity} / {item.threshold}</span>
                  </div>
                  <div className="item-details">
                    <span className="item-grade">Grade: {item.gradeValue}</span>
                    <span className="item-dim">{item.length}x{item.width}x{item.thickness}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LowStockNotification; 