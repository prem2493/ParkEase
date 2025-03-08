import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfiles.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]); // Change to array to store multiple bookings

  // Fetch username & token from localStorage
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate("/");
      return;
    }

    fetchBookings();
  }, []);

  // Fetch user's multiple bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5001/parking/user-bookings/${username}`, {
        headers: { Authorization: `Bearer ${token}` }, // Include token in request
      });

      const data = await response.json();
      if (data.length === 0) {
        setBookings([]);
      } else {
        setBookings(data); // Store multiple bookings
      }
    } catch (error) {
      console.error("Error fetching booking info:", error);
    }
  };

  // Cancel a specific booking
  const cancelBooking = async (spotNumber) => {
    try {
      const response = await fetch(`http://localhost:5000/parking/cancel/${username}/${spotNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.message === "Booking cancelled successfully") {
        alert(data.message);
        setBookings((prevBookings) => prevBookings.filter((b) => b.spot_number !== spotNumber)); // Remove from UI
      } else {
        alert(data.message);
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

      {bookings.length > 0 ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.spot_number} className="booking-item">
              <p>Your booked parking spot: <strong>{booking.spot_number}</strong></p>
              <p>QR Ticket:</p>
              <img 
                src={`/assets/${booking.spot_number}.png`}  
                alt={`QR Code for Spot ${booking.spot_number}`} 
                className="qr-ticket"
              />
              <button onClick={() => cancelBooking(booking.spot_number)} className="cancel-btn">
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no active bookings.</p>
      )}

      <button onClick={() => navigate("/main")}>Back to Parking</button>
    </div>
  );
};

export default UserProfile;
