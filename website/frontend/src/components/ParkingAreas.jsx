import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ParkingAreas.css';

function ParkingAreas({ token }) {
  const [areas, setAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get('http://localhost:5001/parking/areas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAreas(res.data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, [token]);

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.location_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="parking-areas">
      <div className="logo-container">
        <img src="/assets/logo.jpg" alt="Logo" className="logo-image" />
        <h1 className="logo-text">ParkEase</h1>
       </div>
       <h2 className="section-title">Select Parking Area</h2>
      <div className="header-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search area or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      

      <div className="areas-grid">
        {loading ? (
          <p className="loading-text">Loading areas...</p>
        ) : filteredAreas.length > 0 ? (
          filteredAreas.map((area) => (
            <div
              key={area.id}
              className="area-card"
              onClick={() => {console.log('Navigating to areaId:', area.id);
                navigate(`/slots/${area.id}`);}}
            >
              <h3>{area.name}</h3>
              <p>{area.location_description}</p>
            </div>
          ))
        ) : (
          <p className="no-results">No areas found.</p>
        )}
      </div>
    </div>
  );
}

export default ParkingAreas;
