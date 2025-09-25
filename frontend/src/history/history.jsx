import React, { useState, useEffect } from "react";
import "./history.css";

export default function VolunteerLog() {
  const currentUser = {
    name: "Jane Doe",
    email: "jane.doe@email.com"
  };

  const [progress, setProgress] = useState("");
  const [hours, setHours] = useState("");
  const [logs, setLogs] = useState([]);

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
    if (!progress.trim() || !hours.trim()) return;

    const newLog = {
      name: currentUser.name,
      email: currentUser.email,
      description: progress,
      hours: parseFloat(hours),
      timestamp: new Date().toLocaleString()
    };

    setLogs([...logs, newLog]);
    setProgress("");
    setHours("");
  };

  const totalEvents = logs.length;
  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="container modern">
      <h1>Volunteer Progress Log</h1>

      <div className="input-card">
        <textarea
          placeholder="Describe what you worked on..."
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Hours contributed"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <button onClick={handleAddEvent}>+ Add Event</button>
      </div>

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
        <h2>Logged Events</h2>
        {logs.length === 0 ? (
          <p>No events logged yet.</p>
        ) : (
          <ul>
            {logs.map((log, index) => (
              <li key={index} className="modern-card">
                <p className="name">
                  <strong>{log.name}</strong> <span>({log.email})</span>
                </p>
                <p>{log.description}</p>
                <p>
                  <strong>Hours:</strong> {log.hours}
                </p>
                <p className="timestamp">📅 {log.timestamp}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
