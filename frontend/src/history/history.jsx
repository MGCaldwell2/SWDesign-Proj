import React, { useState, useEffect } from "react";
import "./history.css";

export default function VolunteerLog() {
  const currentUser = {
    name: "Jane Doe",
    email: "jane.doe@email.com",
    phone: "123-456-7890", // example phone
  };

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

    if (!progress.trim()) {
      setError("Description is required.");
      return;
    }
    if (progress.length > 200) {
      setError("Description cannot exceed 200 characters.");
      return;
    }
    if (!hours.trim()) {
      setError("Hours are required.");
      return;
    }
    if (isNaN(hours) || parseFloat(hours) <= 0) {
      setError("Hours must be a positive number.");
      return;
    }

    const newLog = {
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      description: progress.trim(),
      hours: parseFloat(hours),
      status,
      timestamp: new Date().toLocaleString(),
    };

    setLogs((prev) => [...prev, newLog]);
    setProgress("");
    setHours("");
    setStatus("Completed");
    setShowForm(false);
  };

  // Group logs by volunteer (name+email as unique key)
  const groupedLogs = logs.reduce((acc, log) => {
    const key = `${log.name}-${log.email}`;
    if (!acc[key]) {
      acc[key] = { ...log, totalHours: 0, events: [] };
    }
    acc[key].totalHours += log.hours;
    acc[key].events.push(log);
    return acc;
  }, {});

  // Convert grouped logs to sorted array
  const sortedVolunteers = Object.values(groupedLogs).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const totalEvents = logs.length;
  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="container modern">
      <div className="header">
        <h1>Volunteer History</h1>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Hours"}
        </button>
      </div>

      {showForm && (
        <div className="input-card">
          {error && <p className="error">{error}</p>}

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

          <button onClick={handleAddEvent}>Save Event</button>
        </div>
      )}

      <div className="summary modern-card">
        <h2>Summary</h2>
        <p>
          <strong>Total Events:</strong> {totalEvents}
        </p>
        <p>
          <strong>Total Hours:</strong> {totalHours}
        </p>
      </div>

      <div className="logs">
        {sortedVolunteers.length === 0 ? (
          <p>No events logged yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {sortedVolunteers.map((volunteer, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="clickable-row"
                    onClick={() =>
                      setExpandedUser(
                        expandedUser === volunteer.email ? null : volunteer.email
                      )
                    }
                  >
                    <td>{volunteer.name}</td>
                    <td>{volunteer.phone || "N/A"}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.totalHours}</td>
                  </tr>

                  {/* Expanded event list */}
                  {expandedUser === volunteer.email && (
                    <tr>
                      <td colSpan="4">
                        <ul className="event-list">
                          {volunteer.events.map((event, i) => (
                            <li key={i}>
                              {event.description} — {event.hours} hrs (
                              {event.status}) 📅 {event.timestamp}
                            </li>
                          ))}
                        </ul>
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
