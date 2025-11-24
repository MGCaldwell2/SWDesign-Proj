import React, { useState, useEffect } from "react";
import "./history.css";

// Shows volunteer's completed events history from backend VolunteerHistory table
export default function VolunteerLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Current user:", parsed);
        if (parsed?.id) {
          setUserId(parsed.id);
          console.log("Set user ID:", parsed.id);
        } else {
          console.warn("No user ID found in stored user data");
        }
      } else {
        console.warn("No current user found in storage");
      }
    } catch (e) {
      console.error("Error parsing currentUser:", e);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log("No userId set, skipping history fetch");
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setFetchError("");
      try {
        console.log(`Fetching history for user ID: ${userId}`);
        const res = await fetch(`http://localhost:5050/api/volunteer/${userId}/history`);
        let data = await res.json().catch(async () => ({ message: await res.text() }));
        console.log("History response:", data);
        if (!res.ok) {
          setFetchError(data.error || data.message || `Failed (status ${res.status})`);
          setHistory([]);
        } else {
            setHistory(Array.isArray(data.history) ? data.history : []);
            console.log("History set to:", data.history);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setFetchError("Network error fetching history");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const totalEvents = history.length;

  return (
    <div className="container modern">
      <div className="header">
        <h1>Volunteer History</h1>
      </div>

      {fetchError && <div className="error">{fetchError}</div>}
      {loading && <p>Loading completed events...</p>}

      <div className="summary modern-card" style={{ background: "linear-gradient(90deg, #667eea, #764ba2)", color: "white", borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", marginBottom: "30px", padding: "24px" }}>
        <h2 style={{ marginBottom: "10px", fontWeight: 700 }}>Summary</h2>
        <div style={{ display: "flex", gap: "40px", fontSize: "18px" }}>
          <div>
            <span style={{ fontWeight: 600 }}>Total Completed Events:</span> {totalEvents}
          </div>
        </div>
      </div>

      <div className="logs">
        {!loading && history.length === 0 && !fetchError && <p>No completed events recorded yet.</p>}
        {history.length > 0 && (
          <table className="event-table" style={{ width: "100%", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
            <thead style={{ background: "linear-gradient(90deg, #667eea, #764ba2)", color: "white" }}>
              <tr>
                <th style={{ fontSize: "16px", fontWeight: 600 }}>Event</th>
                <th style={{ fontSize: "16px", fontWeight: 600 }}>Status</th>
                <th style={{ fontSize: "16px", fontWeight: 600 }}>Volunteer Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} style={{ background: "#f4f7ff" }}>
                  <td>{h.name}</td>
                  <td>{h.status}</td>
                  <td>{h.date || (h.timestamp ? new Date(h.timestamp).toLocaleDateString() : "-")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
