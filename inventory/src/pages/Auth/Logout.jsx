import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSignOutAlt } from 'react-icons/fa';
import './Auth.css';

const Logout = () => {
  const navigate = useNavigate();
  const logoutInitiated = useRef(false);

  useEffect(() => {
    const logout = async () => {
      if (logoutInitiated.current) {
        return;
      }
      logoutInitiated.current = true;

      try {
        await axios.post('/auth/logout');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
      } catch (error) {
        toast.error('Error logging out');
        navigate('/login');
      }
    };

    logout();
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Logging Out</h1>
          <p>Please wait while we sign you out...</p>
        </div>
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
      </div>
    </div>
  );
};

export default Logout;