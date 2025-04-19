import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./UserProfiles.css";

const socket = io("http://localhost:5001");

const UserProfile = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [userDetails, setUserDetails] = useState([]);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchBookings();
    fetchUserDetails();
    socket.on("booking-updated", (updatedBooking) => {
      if (updatedBooking.username === username) {
        fetchBookings();
      }
    });

    return () => {
      socket.off("booking-updated");
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/parking/user-bookings/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      console.log("Fetched bookings:", data);
      setBookings(data.length ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5001/parking/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const datas = await response.json();
      console.log("Fetched user details:", datas);
      
      if (datas.length > 0) {
        setUserDetails(datas[0]); 
      } else {
        console.warn("No user details found!");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  const cancelBooking = async (spotNumber) => {
    try {
      const response = await fetch(`http://localhost:5001/parking/cancel/${username}/${spotNumber}`, {
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
    <div className="profile-main">
      <div className="profile-left">
        <h2>User Profile</h2>
        <p><strong>Username:</strong> {username}</p><br></br>
        <p><strong>Name:</strong> {userDetails.name}</p><br />
        <p><strong>Email:</strong> {userDetails.email}</p><br />
        <p><strong>Phone:</strong> {userDetails.phone}</p><br />
        <p><strong>Active Bookings:</strong> {bookings.length}</p>
        <button onClick={() => navigate("/main")} className="back-btn">Back to Parking</button>
      </div>

      <div className="profile-right">
        <h3>Your Bookings</h3>
        <div className="booking-list">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking.parkslot} className="booking-card">
                <p><strong>Area:</strong> {booking.area || "Main Lot"}</p>
                <p><strong>Spot:</strong> {booking.parkslot}</p>
                <button onClick={() => setSelectedBooking(booking)} className="view-btn">
                  View QR
                </button>
                <button onClick={() => setBookingToCancel(booking)} className="cancel-btn">
                  Cancel Booking
                </button>
                <button onClick={() => navigate(`/map/${booking.parkslot}`)} className="cancel-btn">
                  View Path
                </button>
              </div>
            ))
          ) : (
            <p>No active bookings.</p>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>QR for Spot {selectedBooking.parkslot}</h3>
            <img
              src={`/assets/${selectedBooking.id}.png`}
              alt="QR Code"
              className="qr-img"
            /><br></br>
            <button className="close-btn" onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {bookingToCancel && (
        <div className="modal-overlay" onClick={() => setBookingToCancel(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Cancellation</h3>
            <p>Are you sure you want to cancel your booking for spot <strong>{bookingToCancel.parkslot}</strong>?</p>
            <div >
              <button
                className="confirm-btn"
                onClick={() => {
                  cancelBooking(bookingToCancel.id);
                  setBookingToCancel(null);
                }}
              >
                Yes, Cancel
              </button>
              <button
                className="close-btn"
                onClick={() => setBookingToCancel(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
