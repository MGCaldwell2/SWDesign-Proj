import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/volunteer-history")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddEvent = async () => {
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !progress.trim() || !hours) {
      setError("All fields are required.");
      return;
    }

    if (progress.length > 200) {
      setError("Description cannot exceed 200 characters.");
      return;
    }

    if (isNaN(hours) || parseFloat(hours) <= 0) {
      setError("Hours must be a positive number.");
      return;
    }

    try {
      const userRes = await axios.post(
  "http://localhost:5050/api/users/get-or-create",
  {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
  }
);

       const userId = userRes.data.user_id;

      const logRes = await axios.post("http://localhost:5050/api/volunteer-history", {
        //headers: { Authorization: `Bearer ${token}` }
        user_id: userId,
        event_description: progress.trim(),
        hours: parseFloat(hours),
        status,
      });

      setLogs((prev) => [...prev, logRes.data]);

      setName("");
      setEmail("");
      setPhone("");
      setProgress("");
      setHours("");
      setStatus("Completed");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to add event. Make sure the server is running.");
    }
  };

  // FIXED: safe email access
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
    acc[key].events.push(log);
    return acc;
  }, {});

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
        <button
          className="add-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError(""); // FIX: reset error when toggling form
          }}
        >
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

      <div
        className="summary modern-card"
        style={{
          background: "linear-gradient(90deg, #667eea, #764ba2)",
          color: "white",
          borderRadius: "14px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          marginBottom: "30px",
          padding: "24px",
        }}
      >
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
          <table className="volunteer-table">
            <thead style={{ background: "linear-gradient(90deg, #667eea, #764ba2)", color: "white" }}>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {sortedVolunteers.map((volunteer, index) => (
                <React.Fragment key={volunteer.email || index}>
                  <tr
                    className="clickable"
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

                  {expandedUser === volunteer.email && (
                    <tr className="event-row">
                      <td colSpan="4">
                        <table className="event-table">
                          <thead>
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
                                <td>{event.event_description}</td>
                                <td>{event.hours}</td>
                                <td>{event.status}</td>
                                <td className="timestamp">
                                  {new Date(event.timestamp).toLocaleString()}
                                </td>
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
