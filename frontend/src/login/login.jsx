import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    // Auto-login if user already remembered
    try {
      const storedUser = localStorage.getItem("currentUser");
      const storedSession = sessionStorage.getItem("currentUser");
      if (storedUser || storedSession) {
        const user = storedUser ? JSON.parse(storedUser) : JSON.parse(storedSession);
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/volunteer-history");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;
    if (!email) { newErrors.email = "Email is required"; valid = false; }
    if (!password) { newErrors.password = "Password is required"; valid = false; }
    setErrors(newErrors);
    return valid;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user info and JWT token
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("currentUser", JSON.stringify({ email, role: data.role }));

        setMessage("Login successful");

        // Redirect based on role
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/volunteer-history");
        }
      } else {
        setMessage(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setMessage("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Sign in</h1>
          <p>Please enter your credentials to continue</p>
        </div>

        <div className="login-content">
          <form onSubmit={handleLogin} noValidate>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={errors.email ? "error" : ""}
                autoComplete="email"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={errors.password ? "error" : ""}
                autoComplete="current-password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="controls-row">
              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                Remember me
              </label>

              <button type="submit" className="login-button">Sign In</button>
            </div>

            {message && (
              <div className={`login-message ${message.toLowerCase().includes("success") ? "success" : "error"}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
