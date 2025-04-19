import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsLoggedIn(true);
      setUsername(username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="header">   
      <div className="logo-container">
        <img src="/assets/logo.jpg" alt="Logo" className="logo-image" />
        <h1 className="logo-text">ParkEase</h1>
       </div>

        <div className="top-right-buttons">
          {!isLoggedIn ? (
            <button onClick={() => navigate('/login')}>Login / Register</button>
          ) : (
            <>
              <button onClick={() => navigate('/profile')}>Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </header>
  
      <div className="landing-content">
        <div className="left-side">
          <h2>Find and Reserve Parking Easily!</h2>
          {!isLoggedIn ? (
            <button className="find-button" onClick={() => navigate('/login')}>Find Parking Spots</button>
          ) : (
            <button className="find-button" onClick={() => navigate('/ParkingAreas')}>
            Find Parking Spots
            </button>
          )}
        </div>
        <div className="right-side">
          <img
            src="/assets/img1.png"
            alt="Parking"
            className="parking-image"
          />
        </div>
      </div>
    </div>
  );
  
};

export default Landing;
