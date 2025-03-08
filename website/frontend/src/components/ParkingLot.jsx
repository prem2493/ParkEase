import React, { useState, useEffect } from "react";
import "./ParkingLot.css";

const ParkingLot = ({ username }) => {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Static spot positions (coordinates and labels)
  const staticSpots = [
    { spot_number: 1, x: 220, y: 80, label: "1" },
    { spot_number: 2, x: 320, y: 80, label: "2" },
    { spot_number: 3, x: 420, y: 80, label: "3" },
    { spot_number: 4, x: 220, y: 180, label: "4" },
    { spot_number: 5, x: 320, y: 180, label: "5" },
    { spot_number: 6, x: 420, y: 180, label: "6" },
  ];

  // Fetch data from the backend on component mount
  useEffect(() => {
    fetchParkingData();
  }, []);

  const fetchParkingData = async () => {
    try {
      const response = await fetch("http://localhost:5001/parking");
      const backendData = await response.json();

      // Merge static coordinates with backend data
      const mergedData = staticSpots.map((staticSpot) => {
        const dynamicSpot = backendData.find(
          (dynamic) => dynamic.spot_number === staticSpot.spot_number
        );
        return { ...staticSpot, ...dynamicSpot }; // Merge static and dynamic properties
      });

      setSpots(mergedData);
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
        fetchParkingData(); // Refresh the data
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error booking spot:", error);
    }
  };

  const entryPoint = { x: 50, y: 130 };

  const getPathToSpot = (spot) => {
    const mainRoadX = spot.x;
    return `M${entryPoint.x},${entryPoint.y} L${mainRoadX},${entryPoint.y} L${mainRoadX},${spot.y}`;
  };

  return (
    <div className="parking-container">
      <h2>Parking Lot</h2>
      <div className="relative bg-gray-100 rounded-lg shadow-md" style={{ width: "500px", height: "300px" }}>
        <svg width="500" height="300" className="absolute top-0 left-0">
          {/* Main horizontal road */}
          <path
            d={`M${entryPoint.x},${entryPoint.y} L470,${entryPoint.y}`}
            stroke="#888"
            strokeWidth="10"
            fill="none"
          />

          {/* Vertical connecting roads to each spot */}
          {spots.map((spot) => (
            <path
              key={`road-${spot.spot_number}`}
              d={`M${spot.x},${entryPoint.y} L${spot.x},${spot.y}`}
              stroke="#888"
              strokeWidth="6"
              fill="none"
            />
          ))}

          {/* Entry point */}
          <circle cx={entryPoint.x} cy={entryPoint.y} r="12" fill="#4CAF50" />
          <text
            x={entryPoint.x}
            y={entryPoint.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            E
          </text>

          {/* Highlighted path to the selected spot */}
          {selectedSpot && (
            <path
              d={getPathToSpot(
                spots.find((spot) => spot.spot_number === selectedSpot)
              )}
              stroke="#4CAF50"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Parking spots */}
          {spots.map((spot) => (
            <g
              key={spot.spot_number}
              onClick={() =>
                !spot.is_booked &&
                setSelectedSpot(
                  selectedSpot === spot.spot_number ? null : spot.spot_number
                )
              }
            >
              <rect
                x={spot.x - 20}
                y={spot.y - 20}
                width="40"
                height="40"
                fill={spot.is_booked ? "#FF0000" : "#3B82F6"}
                stroke="#1E3A8A"
                strokeWidth="2"
                rx="4"
                className="cursor-pointer"
              />
              <text
                x={spot.x}
                y={spot.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {spot.is_booked ? "🚗" : `Spot ${spot.label}`}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Booking panel */}
      {selectedSpot && (
        <div className="booking-panel">
          <h3 style={{ color: "red", fontFamily: "Verdana, sans-serif" }}>
            Confirm Booking
          </h3>
          <p style={{ fontFamily: "Verdana, sans-serif" }}>
            Selected Spot: {selectedSpot}
          </p>
          <button onClick={bookSpot}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default ParkingLot;
