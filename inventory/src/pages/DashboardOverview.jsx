import React from 'react';
import GreetingCard from '../component/GreetingCard';
import StatCard from '../component/StatCard';
import SearchBar from '../component/SearchBar';
import { FaDollarSign, FaExchangeAlt, FaUsers, FaBoxOpen } from 'react-icons/fa';
import RevenueChart from '../component/RevenueChart';
import './DashboardOverview.css';

const DashboardOverview = () => {
  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <SearchBar placeholder="Search..." />
      </div>
      <div className="dashboard-grid">
        <div className="greeting-column">
          <GreetingCard name="Admin" dispatchCount={24} />
          <RevenueChart />
        </div>
        <div className="stat-grid">
          <StatCard 
            title="Total Customer" 
            value="12,628" 
            growth="+72.80%" 
            icon={FaUsers} 
            color="#28c76f" 
          />
          <StatCard 
            title="Total Income" 
            value="₹4,679" 
            growth="+29.42%" 
            icon={FaDollarSign} 
            color="#00cfe8" 
          />
          <StatCard 
            title="Product Sold" 
            value="₹2,456" 
            growth="-14.28%" 
            icon={FaBoxOpen} 
            color="#ff9f43" 
          />
          <StatCard 
            title="Transactions" 
            value="₹14,857" 
            growth="+28.14%" 
            icon={FaExchangeAlt} 
            color="#7367f0" 
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
