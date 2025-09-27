import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./UserReg.css";

export default function UserReg() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        alert("Registration successful!");
    };

    return (
        <div className="user-reg-container">
            <form className="user-reg-form" onSubmit={handleSubmit}>
                <h2 className="user-reg-title">User Registration</h2>
                {error && <div className="user-reg-error">{error}</div>}

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