import React, { useState, useEffect } from "react";
import "./history.css";

export default function VolunteerLog() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [progress, setProgress] = useState("");
  const [hours, setHours] = useState("");
  const [status, setStatus] = useState("Completed");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null); // track which user row is expanded

  useEffect(() => {
    const savedLogs = localStorage.getItem("volunteerLogs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("volunteerLogs", JSON.stringify(logs));
  }, [logs]);

  const handleAddEvent = () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone is required.");
      return;
    }
    if (!progress.trim()) {
      setError("Description is required.");
      return;
    }
    if (progress.length > 200) {
      setError("Description cannot exceed 200 characters.");
      return;
    }
    if (!hours.toString().trim()) {
      setError("Hours are required.");
      return;
    }
    if (isNaN(hours) || parseFloat(hours) <= 0) {
      setError("Hours must be a positive number.");
      return;
    }

    const newLog = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      description: progress.trim(),
      hours: parseFloat(hours),
      status,
      timestamp: new Date().toLocaleString(),
    };

    setLogs((prev) => [...prev, newLog]);
    setName("");
    setEmail("");
    setPhone("");
    setProgress("");
    setHours("");
    setStatus("Completed");
    setShowForm(false);
  };

  // Group logs by email (case-insensitive) so same email combines totals
  const groupedLogs = logs.reduce((acc, log) => {
    const key = (log.email || "").toLowerCase().trim();
    if (!acc[key]) {
      acc[key] = {
        email: key,
        name: log.name || key,
        phone: log.phone || "",
        totalHours: 0,
        events: [],
      };
    }
    acc[key].totalHours += Number(log.hours) || 0;
    // Use latest non-empty name/phone if provided
    if (log.name && log.name.trim()) acc[key].name = log.name.trim();
    if (log.phone && log.phone.trim()) acc[key].phone = log.phone.trim();
    acc[key].events.push(log);
    return acc;
  }, {});

  // Convert grouped logs to sorted array
  const sortedVolunteers = Object.values(groupedLogs).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const totalEvents = logs.length;
  const totalHours = logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);

  return (
    <div className="container modern">
      <div className="header">
        <h1>Volunteer History</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Hours"}
        </button>
      </div>

      {showForm && (
        <div className="input-card">
          {error && <p className="error">{error}</p>}

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <textarea
            placeholder="Describe what you worked on (max 200 chars)..."
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            maxLength={200}
          />

          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Hours contributed"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Missed">Missed</option>
          </select>

          <button onClick={handleAddEvent} className="submit-btn">Save Event</button>
        </div>
      )}

      <div className="summary modern-card" style={{ background: "linear-gradient(90deg, #667eea, #764ba2)", color: "white", borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", marginBottom: "30px", padding: "24px" }}>
        <h2 style={{ marginBottom: "10px", fontWeight: 700 }}>Summary</h2>
        <div style={{ display: "flex", gap: "40px", fontSize: "18px" }}>
          <div>
            <span style={{ fontWeight: 600 }}>Total Events:</span> {totalEvents}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Total Hours:</span> {totalHours}
          </div>
        </div>
      </div>

      <div className="logs">
        {sortedVolunteers.length === 0 ? (
          <p>No events logged yet.</p>
        ) : (
          <table className="volunteer-table" style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <thead style={{ background: "linear-gradient(90deg, #667eea, #764ba2)", color: "white" }}>
              <tr>
                <th style={{ fontSize: "17px", fontWeight: 700 }}>Name</th>
                <th style={{ fontSize: "17px", fontWeight: 700 }}>Phone</th>
                <th style={{ fontSize: "17px", fontWeight: 700 }}>Email</th>
                <th style={{ fontSize: "17px", fontWeight: 700 }}>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {sortedVolunteers.map((volunteer, index) => (
                <React.Fragment key={volunteer.email || index}>
                  <tr
                    className="clickable"
                    style={{ background: "#f4f7ff", cursor: "pointer" }}
                    onClick={() =>
                      setExpandedUser(
                        expandedUser === volunteer.email ? null : volunteer.email
                      )
                    }
                  >
                    <td style={{ color: "#667eea", fontWeight: 600 }}>{volunteer.name}</td>
                    <td>{volunteer.phone || "N/A"}</td>
                    <td>{volunteer.email}</td>
                    <td style={{ background: "#e0e7ff", fontWeight: 700 }}>{volunteer.totalHours}</td>
                  </tr>

                  {/* Expanded event list */}
                  {expandedUser === volunteer.email && (
                    <tr className="event-row">
                      <td colSpan="4">
                        <table className="event-table" style={{ width: "100%", marginTop: "10px", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 12px rgba(102,126,234,0.08)" }}>
                          <thead style={{ background: "#e0e7ff" }}>
                            <tr>
                              <th>Description</th>
                              <th>Hours</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {volunteer.events.map((event, i) => (
                              <tr key={i}>
                                <td>{event.description}</td>
                                <td>{event.hours}</td>
                                <td>{event.status}</td>
                                <td className="timestamp">{event.timestamp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
