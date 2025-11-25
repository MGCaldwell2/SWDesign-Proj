import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EventManageForm.css";
import { authHeaders } from "../lib/auth";

function toInputDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d)) return String(v).slice(0, 10);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

export default function EventEditForm() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const skillsOptions = [
    "Spanish",
    "Chinese",
    "First Aid",
    "Crowd Control",
    "Photography",
    "Food Handling",
    "Heavy Lifting",
    "Elder Care",
  ];

  async function refreshEvents() {
    try {
      const res = await fetch("http://localhost:5050/api/events");
      if (!res.ok) { setEvents([]); return; }
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    }
  }

  useEffect(() => { refreshEvents(); }, []);

  const handleSelect = async (e) => {
    const id = e.target.value;
    if (!id) { setSelectedEvent(null); return; }
    try {
      const res = await fetch(`http://localhost:5050/api/events/${id}`);
      if (!res.ok) return;
      const data = await res.json();

      let parsedSkills = [];
      if (Array.isArray(data.skills)) {
        parsedSkills = data.skills;
      } else if (typeof data.skills === "string" && data.skills.trim() !== "") {
        try {
          parsedSkills = JSON.parse(data.skills);
        } catch {
          parsedSkills = [];
        }
      }

      setSelectedEvent({
        ...data,
        skills: parsedSkills,
        urgency: data.urgency || "Low",
        date: data.date ? toInputDate(data.date) : ""
      });
    } catch {}
  };


  const handleChange = (e) => {
    setSelectedEvent({ ...selectedEvent, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill) => {
    setSelectedEvent((prev) => {
      const cur = Array.isArray(prev.skills) ? prev.skills : [];
      const updated = cur.includes(skill) ? cur.filter(s => s !== skill) : [...cur, skill];
      return { ...prev, skills: updated };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

      const payload = {
        name: selectedEvent.name?.trim() || "",
        description: selectedEvent.description?.trim() || "",
        location: selectedEvent.location?.trim() || "",
        date:
          selectedEvent.date && String(selectedEvent.date).trim() !== ""
            ? selectedEvent.date
            : null,
        capacity:
          selectedEvent.capacity === "" ||
          selectedEvent.capacity === undefined ||
          selectedEvent.capacity === null
            ? null
            : Number(selectedEvent.capacity),
        skills: Array.isArray(selectedEvent.skills) ? selectedEvent.skills : [],
        urgency: selectedEvent.urgency || null,
      };



    try {
      const res = await fetch(`http://localhost:5050/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { alert("You must be logged in to update events."); return; }
      if (!res.ok) { alert(data.message || "Failed to update event."); return; }
      navigate("/admin/dashboard", { state: { successMessage: "✅ Event updated successfully!" } });
    } catch {
      alert("An error occurred while updating the event.");
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedEvent.name}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5050/api/events/${selectedEvent.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || "Failed to delete event."); return; }

      alert("✅ Event deleted successfully.");
      setSelectedEvent(null);
      await refreshEvents();
    } catch {
      alert("An error occurred while deleting the event.");
    }
  };

  return (
    <div className="event-form-container">
      <h2>Edit Event</h2>

      <select onChange={handleSelect}>
        <option value="">-- Select Event to Edit --</option>
        {(Array.isArray(events) ? events : []).map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} ({e.date})
          </option>
        ))}
      </select>

      {selectedEvent && (
        <form onSubmit={handleUpdate} className="event-form">
          <label>Event Name</label>
          <input name="name" value={selectedEvent.name || ""} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={selectedEvent.description || ""} onChange={handleChange} required />

          <label>Location</label>
          <textarea name="location" value={selectedEvent.location || ""} onChange={handleChange} required />

          <label>Required Skills</label>
          <div className="checkbox-menu-list">
            {skillsOptions.map((skill) => (
              <label key={skill} className="checkbox-menu-item">
                <input
                  type="checkbox"
                  checked={(selectedEvent.skills || []).includes(skill)}
                  onChange={() => toggleSkill(skill)}
                />
                {skill}
              </label>
            ))}
          </div>

          <label>Urgency</label>
          <select name="urgency" value={selectedEvent.urgency || "Low"} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>Event Date</label>
          <input
            type="date"
            name="date"
            value={selectedEvent.date || ""}
            onChange={handleChange}
          />

          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            value={selectedEvent.capacity ?? ""}
            onChange={handleChange}
          />

          <div className="button-row">
            <button type="submit" className="event-form-btn">Update Event</button>
            <button type="button" className="event-form-btn delete-btn" onClick={handleDelete}>
              🗑️ Delete Event
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
