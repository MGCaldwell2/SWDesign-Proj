import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./UserReg.css";

export default function UserReg() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

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
                    Username
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
                    Email
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="user-reg-input"
                    />
                </label>

                <label className="user-reg-label">
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="user-reg-input"
                    />
                </label>

                <label className="user-reg-label">
                    Confirm Password
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="user-reg-input"
                    />
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
