import React from 'react';
import '../styles/shared.css';

const StatCard = ({ title, value, icon: Icon, color, growth }) => {
  const isPositiveGrowth = growth && growth.startsWith('+');
  const growthColor = isPositiveGrowth ? '#28c76f' : '#ea5455';

  return (
    <div className="page-content" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{title}</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: '#1f2937' }}>{value}</h3>
          {growth && (
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '0.875rem', 
              color: growthColor,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {growth}
            </p>
          )}
        </div>
        <div style={{ 
          backgroundColor: `${color}15`, 
          padding: '0.75rem', 
          borderRadius: '0.5rem',
          color: color
        }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard; 