import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EventManageForm.css";

export default function EventEditForm() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const skillsOptions = [
    "Spanish", "Chinese", "French", "First Aid", "Crowd Control", "Data Entry",
    "Photography", "Food Handling", "Logistics", "Folding and washing Clothes",
    "Heavy Lifting", "Elder Care"
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5050/api/events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching events:", err));
  }, []);

  const handleSelect = async (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedEvent(null);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5050/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Make sure skills field exists as an array
      if (!data.skills) data.skills = [];
      setSelectedEvent(data);
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  };

  const handleChange = (e) => {
    setSelectedEvent({ ...selectedEvent, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill) => {
    setSelectedEvent((prev) => {
      const updatedSkills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updatedSkills };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5050/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedEvent),
      });

      const data = await res.json();
      console.log("Update Event Response:", res.status, data);

      if (res.ok) {
        navigate("/", { state: { successMessage: "✅ Event updated successfully!" } });
      } else {
        alert(data.message || "Failed to update event.");
      }
    } catch (err) {
      console.error("Error updating event:", err);
      alert("An error occurred while updating the event.");
    }
  };

  return (
    <div className="event-form-container">
      <h2>Edit Event</h2>

      <select onChange={handleSelect}>
        <option value="">-- Select Event to Edit --</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} ({e.date})
          </option>
        ))}
      </select>

      {selectedEvent && (
        <form onSubmit={handleUpdate} className="event-form">
          <label>Event Name</label>
          <input name="name" value={selectedEvent.name} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={selectedEvent.description} onChange={handleChange} required />

          <label>Location</label>
          <textarea name="location" value={selectedEvent.location} onChange={handleChange} required />

          <label>Required Skills</label>
          <div className="checkbox-menu-list">
            {skillsOptions.map((skill) => (
              <label key={skill} className="checkbox-menu-item">
                <input
                  type="checkbox"
                  checked={selectedEvent.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                />
                {skill}
              </label>
            ))}
          </div>

          <label>Urgency</label>
          <select name="urgency" value={selectedEvent.urgency} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>Event Date</label>
          <input type="date" name="date" value={selectedEvent.date} onChange={handleChange} />

          <button type="submit" className="event-form-btn">Update Event</button>
        </form>
      )}
    </div>
  );
}
