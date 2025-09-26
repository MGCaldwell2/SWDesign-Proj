import React, { useState } from "react";
import "./login.css";

export default function Login() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const handleForgotPassword = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setResetEmail("");
  };

  const handleResetPassword = () => {
    if (resetEmail.trim() === "") {
      alert("Please enter your email.");
      return;
    }
    alert(`Password reset link sent to ${resetEmail}`);
    handleModalClose();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic here
    alert(`Logged in as ${email}`);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ background: "#fff", color: "#333" }}
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ background: "#fff", color: "#333" }}
            autoComplete="current-password"
            required
          />
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember Me</label>
          </div>
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
        <div className="register-text">
          Forgot password?
          <button type="button" onClick={handleForgotPassword}>
            Click here
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Password</h3>
            <p>Enter your email to receive a reset link:</p>
            <input
              type="email"
              placeholder="Your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={{ background: "#fff", color: "#333" }}
              autoComplete="username"
              required
            />
            <div className="modal-buttons">
              <button className="submit-btn" onClick={handleResetPassword}>
                Send Link
              </button>
              <button className="cancel-btn" onClick={handleModalClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
