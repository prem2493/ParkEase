import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister";
import Landing from "./pages/Landing";
import MainPage from "./pages/Mainpage";
import UserProfile from "./pages/UserProfiles";
import ParkingLot from "./components/ParkingLot";
import Map from "./components/map";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ParkingAreas" element={<MainPage />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/slots/:areaId" element={<ParkingLot token={localStorage.getItem('token')} />} />
      <Route path="/map/:slot" element={<Map token={localStorage.getItem('token')}/>} />
    </Routes>
  </BrowserRouter>
);
