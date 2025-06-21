import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GreetingCard from '../component/GreetingCard';
import StatCard from '../component/StatCard';
import SearchBar from '../component/SearchBar';
import { FaDollarSign, FaExchangeAlt, FaUsers, FaBoxOpen, FaWarehouse, FaArrowDown, FaTruck, FaClock } from 'react-icons/fa';
import RevenueChart from '../component/RevenueChart';
import './DashboardOverview.css';
import axios from 'axios';

const DashboardOverview = () => {
  const [totalMUCs, setTotalMUCs] = useState(null);
  const [inwarded, setInwarded] = useState({ today: null, week: null });
  const [dispatches, setDispatches] = useState({ today: null, week: null });
  const [pendingDispatches, setPendingDispatches] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const mucRes = await axios.get('http://localhost:5000/api/stock-report/dashboard/total-mucs-in-stock');
        setTotalMUCs(mucRes.data.totalMUCsInStock);
        const inwardRes = await axios.get('http://localhost:5000/api/stock-report/dashboard/inwarded-count');
        setInwarded({ today: inwardRes.data.inwardedToday, week: inwardRes.data.inwardedThisWeek });
        const dispatchRes = await axios.get('http://localhost:5000/api/dispatch/dashboard/dispatches-today-week');
        setDispatches({ today: dispatchRes.data.dispatchesToday, week: dispatchRes.data.dispatchesThisWeek });
        const pendingRes = await axios.get('http://localhost:5000/api/dispatch/dashboard/pending-dispatches');
        setPendingDispatches(pendingRes.data.pendingDispatches);
      } catch (err) {
        setTotalMUCs('Err');
        setInwarded({ today: 'Err', week: 'Err' });
        setDispatches({ today: 'Err', week: 'Err' });
        setPendingDispatches('Err');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [location.pathname]);

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <SearchBar placeholder="Search..." />
      </div>
      <div className="dashboard-grid">
        <div className="greeting-column">
          <GreetingCard name="Admin" dispatchCount={pendingDispatches ?? 0} />
          <RevenueChart />
        </div>
        <div className="stat-grid">
          <StatCard 
            title="Total MUCs in Stock" 
            value={loading ? '...' : totalMUCs} 
            growth="" 
            icon={FaWarehouse} 
            color="#28c76f" 
          />
          <StatCard 
            title="Inwarded (Today/Week)" 
            value={loading ? '...' : `${inwarded.today ?? 0} / ${inwarded.week ?? 0}`} 
            growth="" 
            icon={FaArrowDown} 
            color="#00cfe8" 
          />
          <StatCard 
            title="Dispatches (Today/Week)" 
            value={loading ? '...' : `${dispatches.today ?? 0} / ${dispatches.week ?? 0}`} 
            growth="" 
            icon={FaTruck} 
            color="#ff6f61" 
          />
          <StatCard 
            title="Pending Dispatches" 
            value={loading ? '...' : pendingDispatches ?? 0} 
            growth="" 
            icon={FaClock} 
            color="#f9c80e" 
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
