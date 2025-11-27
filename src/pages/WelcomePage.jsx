import { useAuth } from '../contexts/AuthContext';
import './WelcomePage.css';
import React from "react";


const WelcomePage = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Welcome, {user?.name || user?.email}!</h1>
        <div className="user-info">
          <p>Email: {user?.email}</p>
        </div>
      </div>
      
      <div className="welcome-actions">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="welcome-content">
        <h2>You are successfully logged in!</h2>
      </div>
    </div>
  );
};

export default WelcomePage;
