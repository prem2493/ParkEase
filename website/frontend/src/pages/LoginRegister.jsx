import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const LoginRegister = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const payload = isRegister
      ? { username, password, name, email, phone }
      : { username, password };

      const { data } = await axios.post(`http://localhost:5001${endpoint}`, payload);

      if (!isRegister) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        navigate("/");
      } else {
        alert("Registration successful, please login!");
        setIsRegister(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container">
      <div className="logo-container">
        <img src="/assets/logo.jpg" alt="Logo" className="logo-image" />
        <h1 className="logo-text">ParkEase</h1>
      </div>

      <div className="form-container">
        <h2>{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </>
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>
        <button className="toggle-button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
};

export default LoginRegister;
