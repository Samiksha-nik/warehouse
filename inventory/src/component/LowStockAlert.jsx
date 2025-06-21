import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/shared.css';

const LowStockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLowStockItems();
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="low-stock-alert">
      <h3>Low Stock Alerts</h3>
      {lowStockItems.length === 0 ? (
        <p className="no-alerts">No low stock alerts at this time.</p>
      ) : (
        <div className="alert-list">
          {lowStockItems.map((item) => (
            <div key={item._id} className="alert-item">
              <div className="alert-content">
                <span className="product-name">{item.productName}</span>
                <span className="stock-info">
                  Current Stock: <strong>{item.quantity}</strong> / Threshold: {item.threshold}
                </span>
                <span className="grade">Grade: {item.gradeValue}</span>
                <span className="dimensions">
                  {item.length} x {item.width} x {item.thickness}
                </span>
              </div>
              <div className="alert-status">
                <span className="status-badge">Low Stock</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlert; 