import React, { useState, useEffect } from "react";
import "./ParkingLot.css"; // Ensure CSS is imported

const ParkingLot = ({ username }) => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    fetchParkingData();
  }, []);

  // Fetch parking lot data from backend
  const fetchParkingData = async () => {
    try {
      const response = await fetch("http://localhost:5000/parking");
      const data = await response.json();
      console.log("Fetched spots:", data); // Debugging
      setSpots(data);
    } catch (error) {
      console.error("Error fetching parking data:", error);
    }
  };

  // Handle booking
  const bookSpot = async (spotNumber) => {
    try {
      const response = await fetch("http://localhost:5000/parking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spot_number: spotNumber, username }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Spot ${spotNumber} booked successfully!`);
        fetchParkingData(); // Refresh UI
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
            <div
              key={spot.spot_number}
              className={`spot ${spot.is_booked ? "booked" : "available"}`}
              onClick={() => !spot.is_booked && bookSpot(spot.spot_number)}
            >
              {spot.is_booked ? "🚗 Booked" : `Spot ${spot.spot_number}`}
            </div>
          ))
        )}
      </div>

      <div className="entry-exit">🚪 Entry/Exit</div>
    </div>
  );
};

export default ParkingLot;
