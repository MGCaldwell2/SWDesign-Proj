import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserReg.css";

export default function UserReg() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/Login"), 1500);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="user-reg-container">
      <form className="user-reg-form" onSubmit={handleSubmit}>
        <h2 className="user-reg-title">User Registration</h2>
        {error && <div className="user-reg-error">{error}</div>}
        {success && <div className="user-reg-success">{success}</div>}

        <label className="user-reg-label">
          Username (email)
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="user-reg-input"
          />
        </label>

        <label className="user-reg-label">
          Password
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="user-reg-input"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-btn"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="user-reg-label">
          Confirm Password
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="user-reg-input"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="toggle-btn"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button type="submit" className="user-reg-btn">Register</button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/" className="user-reg-link">
          ⬅ Back to Home
        </Link>
      </div>
    </div>
  );
}
