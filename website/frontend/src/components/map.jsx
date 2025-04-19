import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Map = () => {
  const { slot } = useParams();
  const navigate = useNavigate();

  const entryPoint = { x: 50, y: 50 };

  const staticSpots = [
    { spot_id: "A1", x: 150, y: 100 },
    { spot_id: "A2", x: 250, y: 100 },
    { spot_id: "A3", x: 350, y: 100 },
    { spot_id: "A4", x: 450, y: 100 },
    { spot_id: "A5", x: 550, y: 100 },
    { spot_id: "A6", x: 650, y: 100 },
    { spot_id: "A7", x: 150, y: 200 },
    { spot_id: "A8", x: 250, y: 200 },
    { spot_id: "A9", x: 350, y: 200 },
    { spot_id: "A10", x: 450, y: 200 },
    { spot_id: "A11", x: 550, y: 200 },
    { spot_id: "A12", x: 650, y: 200 },
    { spot_id: "A13", x: 350, y: 300 },
    { spot_id: "A14", x: 450, y: 300 }
  ];

  const getPathToSpot = (spot) => {
    const road1Y = 150;
    const connectorX = 400;
    const road2Y = 250;

    if (!spot) return "";

    if (["A13", "A14"].includes(spot.spot_id)) {
      return `M${entryPoint.x},${entryPoint.y} 
              L${entryPoint.x},${road1Y} 
              L${connectorX},${road1Y} 
              L${connectorX},${road2Y} 
              L${spot.x},${road2Y} 
              L${spot.x},${spot.y}`;
    } else {
      return `M${entryPoint.x},${entryPoint.y} 
              L${entryPoint.x},${road1Y} 
              L${spot.x},${road1Y} 
              L${spot.x},${spot.y}`;
    }
  };

  const targetSpot = staticSpots.find((s) => s.spot_id === slot);

  return (
    <div className="parking-container">
      <h2>Smart Parking Layout</h2>
      <div className="relative bg-gray-100 rounded-lg shadow-md" style={{ width: "750px", height: "350px" }}>
        <svg width="750" height="350" className="absolute top-0 left-0">
          {/* Roads */}
          <path d="M100,150 L700,150" stroke="#888" strokeWidth="10" fill="none" />
          <path d="M400,150 L400,250" stroke="#888" strokeWidth="8" fill="none" />
          <path d="M100,250 L700,250" stroke="#888" strokeWidth="8" fill="none" />

          {/* Entry */}
          <circle cx={entryPoint.x} cy={entryPoint.y} r="12" fill="#4CAF50" />
          <text x={entryPoint.x} y={entryPoint.y + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">E</text>

          {/* Vertical paths to spots */}
          {staticSpots.map((spot) => (
            <path
              key={`road-${spot.spot_id}`}
              d={`M${spot.x},150 L${spot.x},${spot.y}`}
              stroke="#bbb"
              strokeWidth="3"
              fill="none"
            />
          ))}

          {/* Highlighted path to target spot */}
          {targetSpot && (
            <path
              d={getPathToSpot(targetSpot)}
              stroke="#4CAF50"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Parking spots */}
          {staticSpots.map((spot) => (
            <g key={spot.spot_id}>
              <rect
                x={spot.x - 20}
                y={spot.y - 20}
                width="40"
                height="40"
                fill={slot === spot.spot_id ? "#2563eb" : "#3B82F6"}
                stroke="#1E3A8A"
                strokeWidth="2"
                rx="4"
              />
              <text
                x={spot.x}
                y={spot.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {spot.spot_id}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <button onClick={() => navigate('/profile')} className="back-button">
        Back
      </button>
    </div>
  );
};

export default Map;
