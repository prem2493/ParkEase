import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import "./UserProfiles.css";

const socket = io("http://localhost:5001"); // change this to your backend URL

const UserProfile = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchBookings();

    // 👂 Listen for real-time booking updates
    socket.on("booking-updated", (updatedBooking) => {
      if (updatedBooking.username === username) {
        fetchBookings(); // refresh bookings for the current user
      }
    });

    // 🧹 Clean up socket connection
    return () => {
      socket.off("booking-updated");
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5001/parking/user-bookings/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setBookings(data.length ? data : []);
    } catch (error) {
      console.error("Error fetching booking info:", error);
    }
  };

  const cancelBooking = async (parkslot) => {
    try {
      const response = await fetch(`http://localhost:5001/parking/cancel/${username}/${parkslot}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      alert(data.message);
      if (data.message === "Booking cancelled successfully") {
        setBookings((prev) => prev.filter((b) => b.parkslot !== parkslot));

        // 📨 Optionally notify server via socket
        socket.emit("booking-cancelled", {
          username,
          parkslot,
        });
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

      <div className="booking-wrapper">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.parkslot} className="booking-card">
              <p>Spot Number: <strong>{booking.parkslot}</strong></p>
              <img 
                src={`/assets/${booking.parkslot}.png`}  
                alt={`QR Code for Spot ${booking.parkslot}`} 
                className="qr-ticket"
              /><br />
              <button onClick={() => cancelBooking(booking.parkslot)} className="cancel-btn">
                Cancel Booking
              </button>
            </div>
          ))
        ) : (
          <p className="no-bookings">You have no active bookings.</p>
        )}
      </div>

      <button onClick={() => navigate("/main")} className="back-btn">Back to Parking</button>
    </div>
  );
};

export default UserProfile;
