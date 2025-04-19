// client/src/pages/MainPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParkingAreas from '../components/ParkingAreas';
import './Mainpage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaint, setComplaint] = useState('');
  const token = localStorage.getItem('token');

  const submitComplaint = async () => {
    if (!complaint.trim()) {
      alert('Complaint cannot be empty');
      return;
    }

    try {
      const username = localStorage.getItem('username');
      const response = await fetch('http://localhost:5001/parking/submit-complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, complaint }),
      });

      const data = await response.json();
      alert(data.message);
      setComplaint('');
      setShowComplaintForm(false);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Something went wrong');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="main-container">
      {/* Parking Areas as a separate block */}
      <div className="parking-areas-block">
        <ParkingAreas token={token} />
      </div>

      {/* Buttons for Profile, Complaints, and Logout */}
      <div className="top-right-buttons">
        <button onClick={() => navigate('/profile')}>User Profile</button>
        <button onClick={() => setShowComplaintForm(true)}>Complaints</button>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/');
          }}
          style={{ marginLeft: '10px' }}
        >
          Logout
        </button>
      </div>

      {showComplaintForm && (
        <div className="complaint-modal">
          <h3>Submit a Complaint</h3>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Enter your complaint here..."
          ></textarea>
          <button onClick={submitComplaint}>Submit</button>
          <button onClick={() => setShowComplaintForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default MainPage;