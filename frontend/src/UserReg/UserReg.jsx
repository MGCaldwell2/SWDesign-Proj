import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserReg.css";

export default function UserReg() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("email and password are required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const role = isAdmin ? "admin" : "volunteer";

    try {
      const res = await fetch("http://localhost:5050/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ id: data.id, email: data.email, role: data.role })
        );
        setSuccess("Registration successful! Let's finish your profile…");
        const target = data.needs_profile ? "/AccountManage" : "/";
        setTimeout(() => navigate(target), 800);
      } else {
        setSuccess("Registration successful! Redirecting to login…");
        setTimeout(() => navigate("/Login"), 1200);
      }
    } catch {
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
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="user-reg-input"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="toggle-btn"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="user-reg-label">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <span style={{ marginLeft: "0.5rem" }}>
            Register as admin (otherwise volunteer)
          </span>
        </label>

        <button type="submit" className="user-reg-btn">Register</button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/" className="user-reg-link">⬅ Back to Home</Link>
      </div>
    </div>
  );
}
