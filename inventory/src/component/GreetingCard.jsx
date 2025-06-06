import React from 'react';
import { FaTruck } from 'react-icons/fa';
import '../styles/shared.css';

const GreetingCard = ({ name = 'Admin', dispatchCount = 0 }) => {
  const currentHour = new Date().getHours();
  let greeting = '';

  if (currentHour < 12) {
    greeting = 'Good Morning';
  } else if (currentHour < 18) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }

  return (
    <div className="page-content" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
            {greeting}, {name}
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
            Welcome back to your inventory dashboard
          </p>
          {dispatchCount > 0 && (
            <p style={{ margin: '0.5rem 0 0 0', color: '#2563eb' }}>
              You have {dispatchCount} pending dispatches
            </p>
          )}
        </div>
        <button 
          className="track-order-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <FaTruck style={{ fontSize: '1.1rem' }} />
          <span>Track Orders</span>
        </button>
      </div>
    </div>
  );
};

export default GreetingCard; 