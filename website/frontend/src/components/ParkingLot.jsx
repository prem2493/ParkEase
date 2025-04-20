import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ParkingLot.css';

const ParkingLot = ({ token }) => {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [username, setUsername] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedid, setSelectedid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const socketRef = useRef();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5001', {
        auth: { token },
      });
    }

    const socket = socketRef.current;
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || 'User');

    if (spots.length === 0) {
      fetchParkingData();
    }

    const handleBookingUpdate = (updatedSpot) => {
      if (updatedSpot && updatedSpot.spot_number) {
        setSpots((prevSpots) =>
          prevSpots.map((spot) =>
            spot.id === updatedSpot.spot_number
              ? { ...spot, reserved: updatedSpot.reserved }
              : spot
          )
        );
      }
    };

    socket.on('bookingUpdate', handleBookingUpdate);

    return () => {
      socket.off('bookingUpdate', handleBookingUpdate);
    };
  }, [areaId, token, spots.length]);

  const fetchParkingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/parking/slots/${areaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const backendData = await response.json();
      if (!Array.isArray(backendData)) {
        throw new Error('Invalid data format: expected an array');
      }
      const mappedSpots = backendData.map((spot) => ({
        id: spot.id,
        reserved: spot.reserved,
        parked: spot.parked,
        spot_number: spot.slot_number,
      }));
      setSpots(mappedSpots.sort((a, b) => a.id - b.id));
    } catch (error) {
      setNotification(`Error loading data: ${error.message}`);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const bookSpot = async () => {
    if (!selectedSpot) return;
    try {
      const response = await fetch('http://localhost:5001/parking/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spot_number: selectedid, username,slot:selectedSpot }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotification(`Spot ${selectedSpot} booked successfully!`);
        setSelectedSpot(null);
        setSelectedid(null);
      } else {
        setNotification(data.message || 'Booking failed');
      }
    } catch (error) {
      setNotification(`Error booking spot: ${error.message}`);
    }
  };

  return (
    <div className="parking-container">
      <div className="logo-container">
        <img src="/assets/logo.jpg" alt="Logo" className="logo-image" />
        <h1 className="logo-text">ParkEase</h1>
      </div>

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

      <button onClick={() => navigate('/main')} className="back-button">
        Back to Main Page
      </button>

      <h2>Parking Lot</h2>

      {notification && <div className="notification">{notification}</div>}

      {loading ? (
        <p className="loading-text">Loading areas...</p>
      ) : spots.length > 0 ? (
        <div className="spots-container">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className={`spot-card ${spot.reserved ? spot.parked? 'parked' : 'reserved' :''}`}
              onClick={() => {
                if (!spot.reserved) {
                  setSelectedSpot(selectedSpot === spot.spot_number ? null : spot.spot_number);
                  setSelectedid(selectedid === spot.id ? null : spot.id);
                }
              }}
              aria-disabled={spot.reserved}
            >
              {spot.reserved && spot.parked ? '🚗' : `Spot ${spot.spot_number}`}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-results">No areas found or error occurred.</p>
      )}

      {selectedSpot && (
        <div className="booking-panel">
          <h3 style={{ color: 'red', fontFamily: 'Verdana, sans-serif' }}>Confirm Booking</h3>
          <p style={{ fontFamily: 'Verdana, sans-serif' }}>Selected Spot: {selectedSpot}</p>
          <button onClick={bookSpot}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default ParkingLot;
