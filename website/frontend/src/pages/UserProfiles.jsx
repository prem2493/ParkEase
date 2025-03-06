import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfiles.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  
  // Fetch username & token from localStorage
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate("/");
      return;
    }

    fetchBooking();
  }, []);

  // Fetch user's booking info
  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/parking/user-booking/${username}`, {
        headers: { Authorization: `Bearer ${token}` }, // Include token in request
      });

      const data = await response.json();
      if (data.message === "No booking found") {
        setBooking(null);
      } else {
        setBooking(data);
      }
    } catch (error) {
      console.error("Error fetching booking info:", error);
    }
  };

  const cancelBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/parking/cancel/${username}`, {
        method: "DELETE", // DELETE method for cancellation
        headers: { Authorization: `Bearer ${token}` }, // Include token in request headers
      });
  
      const data = await response.json();
      if (data.message === "Booking cancelled successfully") {
        alert(data.message);
        setBooking(null); // Clear booking from UI after cancellation
      } else {
        alert(data.message); // Show error message if any
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Something went wrong!");
    }
  };
  
  
  

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <h3>Username: {username || "Unknown"}</h3>

      {booking ? (
        <div>
        <p>Your booked parking spot: <strong>{booking.spot_number}</strong></p>
        <p>QR Ticket:</p>
        <img 
          src={`/assets/${booking.spot_number}.png`}  
          
          alt={`QR Code for Spot ${booking.spot_number}`} 
          style={{ width: "200px" }} 
          
        />
      </div>
      ) : (
        <p>You have no active bookings.</p>
      )}

      {booking && (
      <button onClick={cancelBooking} style={{ marginTop: "10px", padding: "10px", backgroundColor: "red", color: "white" }}>
      Cancel Booking
      </button>
      )}

      <button onClick={() => navigate("/main")}>Back to Parking</button>
    </div>
  );
};

export default UserProfile;
