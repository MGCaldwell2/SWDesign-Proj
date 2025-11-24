import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  // Forgot password state (UI-only demo)
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // Remember me
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    try {
      const storedLocal = localStorage.getItem("currentUser");
      const storedSession = sessionStorage.getItem("currentUser");
      if (storedLocal) {
        setRemember(true);
        const user = JSON.parse(storedLocal);
        navigate(user.role === 'admin' ? "/admin/dashboard" : "/dashboard");
      } else if (storedSession) {
        const user = JSON.parse(storedSession);
        navigate(user.role === 'admin' ? "/admin/dashboard" : "/dashboard");
      }
    } catch {
      /* ignore storage errors */
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
        // Most backends expect { email, password }. If yours expects { username, password }, switch back.
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.message || "Invalid email or password");
        return;
      }

      // Accept common token field names
      const token = data.token || data.accessToken || data.jwt || null;
      if (!token || typeof token !== "string") {
        setMessage("Login succeeded but no token returned.");
        return;
      }

      // Get user role from response (backend returns role directly in data)
      const userRole = data.role || 'volunteer';
      const userId = data.id || null;

      // Store raw token (no JSON.stringify) and user info with role
      const userInfo = { email, role: userRole, id: userId };
      
      if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("currentUser", JSON.stringify(userInfo));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("currentUser");
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("currentUser", JSON.stringify(userInfo));
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
      }

      setMessage("Login successful");
      // Navigate based on role
      navigate(userRole === 'admin' ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setMessage("Login failed. Please try again.");
    }
  };

  // Demo/Test login - bypasses authentication
  const handleDemoLogin = (role = 'user') => {
    const demoUser = role === 'admin' 
      ? { email: 'admin@demo.com', role: 'admin' }
      : { email: 'volunteer@demo.com', role: 'user' };
    
    localStorage.setItem("currentUser", JSON.stringify(demoUser));
    localStorage.setItem("token", "demo-token-" + role);
    
    setMessage(`Logged in as demo ${role}`);
    
    // Navigate to appropriate dashboard
    setTimeout(() => {
      if (role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 500);
  };


  const openReset = () => {
    setResetMessage("");
    setResetEmail(email || "");
    setNewPassword("");
    setConfirmPassword("");
    setShowReset(true);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setResetMessage("");

    if (!resetEmail) return setResetMessage("Please enter your account email.");
    if (!newPassword) return setResetMessage("Please enter a new password.");
    if (newPassword !== confirmPassword) return setResetMessage("Passwords do not match.");

    // Demo-only: local fake reset
    const stored = localStorage.getItem(resetEmail);
    if (!stored) return setResetMessage("No account found for that email.");

    try {
      const userObj = JSON.parse(stored);
      userObj.password = newPassword;
      localStorage.setItem(resetEmail, JSON.stringify(userObj));
      setResetMessage("Password updated successfully. You can now sign in.");
      setEmail(resetEmail);
      setPassword("");
      setShowReset(false);
    } catch {
      setResetMessage("Failed to update password. Try again.");
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

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="login-button">Sign In</button>
                <button type="button" className="forgot-link" onClick={openReset}>Forgot password?</button>
              </div>
            </div>

            {message && (
              <div className={`login-message ${message.toLowerCase().includes("success") ? "success" : "error"}`}>
                {message}
              </div>
            )}
          </form>

          {/* Demo Login Buttons */}
          <div className="demo-login-section">
            <div className="divider">
              <span>Or try demo access</span>
            </div>
            <div className="demo-buttons">
              <button 
                type="button" 
                className="demo-button user-demo"
                onClick={() => handleDemoLogin('user')}
              >
                <span className="demo-icon">👤</span>
                <div>
                  <strong>Demo Volunteer</strong>
                  <small>Access user dashboard</small>
                </div>
              </button>
              <button 
                type="button" 
                className="demo-button admin-demo"
                onClick={() => handleDemoLogin('admin')}
              >
                <span className="demo-icon">🛡️</span>
                <div>
                  <strong>Demo Admin</strong>
                  <small>Access admin dashboard</small>
                </div>
              </button>
            </div>
          </div>

          {showReset && (
            <div className="reset-card" role="dialog" aria-label="Reset password">
              <h3>Reset password</h3>
              <form onSubmit={handleReset}>
                <div className="form-field">
                  <label htmlFor="resetEmail">Account email</label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="newPassword">New password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="login-button">Update password</button>
                  <button type="button" className="cancel-button" onClick={() => setShowReset(false)}>Cancel</button>
                </div>

                {resetMessage && (
                  <div className={`login-message ${resetMessage.toLowerCase().includes("success") ? "success" : "error"}`}>
                    {resetMessage}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
