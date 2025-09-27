import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = JSON.parse(localStorage.getItem(email));

    if (userData && userData.password === password) {
      setLoginMessage(`Welcome back, ${userData.name}! You have successfully logged in.`);
      setErrors({ email: "", password: "" });
    } else {
      setLoginMessage("Email or password is incorrect. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <h1>Sign In</h1>
        <p>Welcome back! Please sign in to your account.</p>
      </header>

      <div className="login-content">
        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

          {loginMessage && (
            <div className={`login-message ${loginMessage.includes('Welcome') ? 'success' : 'error'}`}>
              {loginMessage}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <Link to="/UserRegistration" className="register-link">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
