import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParkingLot from "../components/ParkingLot";
import "./Mainpage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      navigate("/");
    } else {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="main-container">
      <h1 >Welcome, {username|| "User"}!</h1>

     
      <ParkingLot username={username} />

      {/* Buttons for Profile and Logout */}
      <div >
        <button onClick={() => navigate("/profile")}>User Profile</button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            navigate("/");
          }}
          style={{ marginLeft: "10px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default MainPage;
