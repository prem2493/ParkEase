import React, { useState, useEffect } from "react";
import "./ParkingLot.css";


const ParkingLot = ({ username }) => {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    fetchParkingData();
  }, []);

  const fetchParkingData = async () => {
    try {
      const response = await fetch("http://localhost:5001/parking");
      const data = await response.json();
      setSpots(data);
    } catch (error) {
      console.error("Error fetching parking data:", error);
    }
  };

  const bookSpot = async () => {
    if (!selectedSpot) return;
    try {
      const response = await fetch("http://localhost:5001/parking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spot_number: selectedSpot, username }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Spot ${selectedSpot} booked successfully!`);
        setSelectedSpot(null);
        fetchParkingData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error booking spot:", error);
    }
  };

  return (
    <div className="parking-container">
      <h2>Parking Lot</h2>
      <div className="grid">
        {spots.length === 0 ? (
          <p>Loading spots...</p>
        ) : (
          spots.map((spot) => (
            <button
              key={spot.spot_number}
              className={`spot ${spot.is_booked ? "booked" : "available"} ${selectedSpot === spot.spot_number ? "selected" : ""}`}
              onClick={() =>
                !spot.is_booked &&
                setSelectedSpot(selectedSpot === spot.spot_number ? null : spot.spot_number)
              }
            >
              {spot.is_booked ? "🚗 Booked" : `Spot ${spot.spot_number}`}
            </button>
          ))
        )}
      </div>
      {selectedSpot && (
        <div className="booking-panel">
          <h3 style={{ color: 'red', fontFamily: 'Verdana, sans-serif' }}>
        Confirm Booking
      </h3>
      <p style={{fontFamily: 'Verdana, sans-serif' }}>
        Selected Spot: {selectedSpot}
      </p>

          <button onClick={bookSpot}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default ParkingLot;

