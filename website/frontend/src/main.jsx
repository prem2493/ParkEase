import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister";
import MainPage from "./pages/Mainpage";
import UserProfile from "./pages/UserProfiles";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  </BrowserRouter>
);
