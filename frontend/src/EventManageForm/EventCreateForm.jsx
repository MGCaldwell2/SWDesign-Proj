import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EventManageForm.css";

export default function EventCreateForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    capacity: "",
    skills: [], // currently not persisted; kept for future enhancement
    urgency: "",
  });

  const skillsOptions = [
    "Spanish", "Chinese", "French", "First Aid", "Crowd Control", "Data Entry",
    "Photography", "Food Handling", "Logistics", "Folding and washing Clothes",
    "Heavy Lifting", "Elder Care"
  ];

  const urgencyOptions = ["Low", "Medium", "High"];
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        capacity: formData.capacity === "" ? null : Number(formData.capacity),
      };

      const res = await fetch("http://localhost:5050/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.warn("Non-JSON response while creating event:", text);
        data = { message: text }; // fallback
      }
      console.log("Create Event Response:", res.status, data);

      if (res.ok) {
        navigate("/", { state: { successMessage: "✅ Event created successfully!" } });
      } else {
        alert(data.message || `Failed to create event (status ${res.status}).`);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("An error occurred while creating the event.");
    }
  };

  return (
    <div className="event-form-container">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <label>Event Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Location</label>
        <textarea name="location" value={formData.location} onChange={handleChange} required />

        <label>Required Skills</label>
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

        <label>Urgency</label>
        <select name="urgency" value={formData.urgency} onChange={handleChange} required>
          <option value="">-- Select Urgency --</option>
          {urgencyOptions.map((u) => <option key={u}>{u}</option>)}
        </select>

        <label>Event Date</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <label>Capacity (optional)</label>
        <input
          type="number"
          name="capacity"
          min="0"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="e.g. 50"
        />

        <button type="submit" className="event-form-btn">Create Event</button>
      </form>
    </div>
  );
}
