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
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Use ref to persist socket instance and avoid recreation
  const socketRef = useRef();

  useEffect(() => {
    console.log('useEffect running with areaId:', areaId, 'token:', token);
    

    // Initialize socket only if not already set
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5001', {
        auth: { token },
      });
      console.log('Socket initialized');
    }

    const socket = socketRef.current;

    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || 'User');

    // Fetch data only if spots is empty (initial load)
    if (spots.length === 0) {
      fetchParkingData();
    }

    // Set up socket listener
    const handleBookingUpdate = (updatedSpot) => {
      console.log('Received booking update:', updatedSpot);
      if (updatedSpot && updatedSpot.spot_number) {
        setSpots((prevSpots) =>
          prevSpots.map((spot) =>
            spot.spot_number === updatedSpot.spot_number
              ? { ...spot, reserved: updatedSpot.reserved }
              : spot
          )
        );
      } else {
        console.warn('Invalid booking update:', updatedSpot);
      }
    };
    socket.on('bookingUpdate', handleBookingUpdate);

    // Cleanup
    return () => {
      socket.off('bookingUpdate', handleBookingUpdate);
    };
  }, [areaId, token, navigate, spots.length]); 

  const fetchParkingData = async () => {
    console.log('Fetching initial data for areaId:', areaId);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/parking/slots/${areaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const backendData = await response.json();
      console.log('Initial backend data:', backendData);
      if (!Array.isArray(backendData)) {
        throw new Error('Invalid data format: expected an array');
      }
      const mappedSpots = backendData.map((spot) => ({
        id: spot.id || spot.spot_number || spot.slot_number,
        reserved: spot.reserved || spot.is_booked || false,
        spot_number: spot.spot_number || spot.id || spot.slot_number,
      }));
      setSpots(mappedSpots);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      setNotification(`Error loading data: ${error.message}`);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const bookSpot = async () => {
    if (!selectedSpot) return;
    try {
      console.log('Booking spot:', { selectedSpot, username, token });
      const response = await fetch('http://localhost:5001/parking/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spot_number: selectedSpot, username }),
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (response.ok) {
        setNotification(`Spot ${selectedSpot} booked successfully!`);
        setSelectedSpot(null);
        // Rely on WebSocket update, no refetch
      } else {
        setNotification(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Error booking spot:', error);
      setNotification(`Error booking spot: ${error.message}`);
    }
  };

  // Log render to debug blinking
  console.log('Component render with spots:', spots, 'loading:', loading);

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
              className={`spot-card ${spot.reserved ? 'reserved' : ''}`}
              onClick={() => !spot.reserved && setSelectedSpot(selectedSpot === spot.id ? null : spot.id)}
              aria-disabled={spot.reserved}
            >
              {spot.reserved ? '🚗' : `Spot ${spot.spot_number}`}
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