import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";   // 👈 import navigate
import "./EventManageForm.css";

export default function EventManageForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    skills: [],
    urgency: "",
    date: "",
  });

  const skillsOptions = [
    "Spanish",
    "Chinese",
    "French",
    "First Aid",
    "Crowd Control",
    "Data Entry",
    "Photography",
    "Food Handling",
    "Logistics",
    "Folding and washing Clothes",
    "Heavy Lifting",
    "Elder Care"
  ];

  const urgencyOptions = ["Low", "Medium", "High"];

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();  // 👈 hook for navigation

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Event Created!");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="event-form-container">
      <h2>Create / Manage Event</h2>
      <form onSubmit={handleSubmit} className="event-form">
        
        <label>Event Name (required, max 100 chars)</label>
        <input
          type="text"
          name="name"
          maxLength="100"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Event Description (required)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>

        <label>Location (required)</label>
        <textarea
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        ></textarea>

        <label>Required Skills (multi-select menu)</label>
        <div className="checkbox-menu" ref={menuRef}>
          <div
            className="checkbox-menu-header"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {formData.skills.length > 0
              ? formData.skills.join(", ")
              : "Select skills"}
            <span className="arrow">{menuOpen ? "▲" : "▼"}</span>
          </div>

          {menuOpen && (
            <div className="checkbox-menu-list">
              {skillsOptions.map((skill) => (
                <label key={skill} className="checkbox-menu-item">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
          )}
        </div>

        <label>Urgency (required)</label>
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Urgency --</option>
          {urgencyOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <label>Event Date (required)</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <button type="submit" className="event-form-btn">
          Create Event
        </button>

        {/* 👇 Back to Home button */}
        <button
          type="button"
          className="event-form-btn"
          style={{ background: "#6c757d", marginTop: "10px" }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </form>
    </div>
  );
}
