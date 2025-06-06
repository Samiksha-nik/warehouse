import React, { useState } from 'react';
import '../styles/shared.css';

const RevenueChart = () => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });

  // Sample data for Amazon and Flipkart revenue
  const revenueData = [
    { month: 'Jan', amazon: 15000, flipkart: 12000 },
    { month: 'Feb', amazon: 22000, flipkart: 19000 },
    { month: 'Mar', amazon: 18000, flipkart: 15000 },
    { month: 'Apr', amazon: 25000, flipkart: 22000 },
    { month: 'May', amazon: 21000, flipkart: 18000 },
    { month: 'Jun', amazon: 28000, flipkart: 25000 },
  ];

  const maxRevenue = Math.max(
    ...revenueData.map(item => Math.max(item.amazon, item.flipkart))
  );

  const handleMouseEnter = (e, data, platform) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const chartRect = e.currentTarget.closest('.revenue-chart-card').getBoundingClientRect();
    
    setTooltip({
      show: true,
      x: rect.left - chartRect.left + (rect.width / 2),
      y: rect.top - chartRect.top - 45,
      data: {
        value: data[platform],
        platform,
        month: data.month
      }
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, data: null });
  };

  return (
    <div className="revenue-chart-card">
      <h3>Revenue Overview</h3>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color amazon"></div>
          <span>Amazon</span>
        </div>
        <div className="legend-item">
          <div className="legend-color flipkart"></div>
          <span>Flipkart</span>
        </div>
      </div>
      <div className="chart-container">
        {revenueData.map((item, index) => (
          <div key={index} className="chart-bar-wrapper">
            <div className="chart-bars">
              <div 
                className="chart-bar amazon"
                style={{
                  height: `${(item.amazon / maxRevenue) * 100}%`
                }}
                onMouseEnter={(e) => handleMouseEnter(e, item, 'amazon')}
                onMouseLeave={handleMouseLeave}
              />
              <div 
                className="chart-bar flipkart"
                style={{
                  height: `${(item.flipkart / maxRevenue) * 100}%`
                }}
                onMouseEnter={(e) => handleMouseEnter(e, item, 'flipkart')}
                onMouseLeave={handleMouseLeave}
              />
            </div>
            <span className="chart-label">{item.month}</span>
          </div>
        ))}
      </div>
      {tooltip.show && tooltip.data && (
        <div 
          className="chart-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="tooltip-content">
            <span className="tooltip-platform">{tooltip.data.platform}</span>
            <span className="tooltip-month">{tooltip.data.month}</span>
            <span className="tooltip-value">₹{tooltip.data.value.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart; 