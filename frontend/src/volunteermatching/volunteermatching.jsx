
import React, { useMemo, useState, useEffect } from "react";
import "./volunteermatching.css";

const API_BASE = "/api";

export default function VolunteerMatching() {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
        
        const [volsRes, evtsRes] = await Promise.all([
          fetch(`${API_BASE}/volunteers`, { headers }),
          fetch(`${API_BASE}/events`, { headers })
        ]);

        if (!volsRes.ok || !evtsRes.ok) {
          throw new Error('Failed to fetch data. Please make sure you are logged in.');
        }

        const [vols, evts] = await Promise.all([
          volsRes.json(),
          evtsRes.json()
        ]);

        setVolunteers(Array.isArray(vols) ? vols : []);
        
        // Parse skills from JSON for each event
        const parsedEvents = (Array.isArray(evts) ? evts : []).map(event => {
          let requiredSkills = [];
          if (Array.isArray(event.skills)) {
            requiredSkills = event.skills;
          } else if (typeof event.skills === "string" && event.skills.trim() !== "") {
            try {
              requiredSkills = JSON.parse(event.skills);
            } catch {
              requiredSkills = [];
            }
          }
          return { ...event, requiredSkills };
        });
        
        setEvents(parsedEvents);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load volunteers or events. Please check your login status.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch registration status when volunteer is selected
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedVolunteerId) {
        setRegisteredEventIds(new Set());
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/volunteer/${selectedVolunteerId}/registrations`);
        if (res.ok) {
          const data = await res.json();
          // data.eventNames contains array of event names instead of IDs
          setRegisteredEventIds(new Set(data.eventNames));
        }
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }
    };

    fetchRegistrations();
  }, [selectedVolunteerId]);


  function skillOverlap(volunteer, event) {
    const v = new Set(volunteer?.skills || []);
    const req = event?.requiredSkills || [];
    return req.reduce((acc, s) => acc + (v.has(s) ? 1 : 0), 0);
  }

  function isEligible(volunteer, event) {
    const reqLen = (event?.requiredSkills || []).length || 0;
    
    // If no skills are required, everyone is eligible
    if (reqLen === 0) return true;
    
    // If skills are required, volunteer must have at least 50% of them
    const overlap = skillOverlap(volunteer, event);
    return overlap >= reqLen / 2;
  }

  const selectedVolunteer = useMemo(
    () => volunteers.find((v) => v.id === Number(selectedVolunteerId)),
    [selectedVolunteerId, volunteers]
  );

  const eligibleEvents = useMemo(() => {
    if (!selectedVolunteer) return [];
    return events
      .filter((e) => isEligible(selectedVolunteer, e))
      .map((e) => ({
        ...e,
        overlap: skillOverlap(selectedVolunteer, e),
        reqLen: (e.requiredSkills || []).length
      }))
      .sort((a, b) => b.overlap - a.overlap);
  }, [selectedVolunteer, events]);

  const filteredVolunteers = useMemo(() => {
    if (!searchTerm.trim()) return volunteers;
    const term = searchTerm.toLowerCase();
    return volunteers.filter(
      (v) =>
        v.name?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term) ||
        v.city?.toLowerCase().includes(term)
    );
  }, [volunteers, searchTerm]);

  async function handleMatch(eventId) {
    if (!selectedVolunteer || !eventId) return;
    
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ volunteerId: selectedVolunteer.id, eventId })
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveStatus({ type: "error", message: data.error || "Failed to match volunteer." });
        return;
      }
      const event = events.find(e => e.id === eventId);
      setSaveStatus({ 
        type: "success", 
        message: `✓ Successfully registered ${selectedVolunteer.name} for ${event?.name}` 
      });
      
      // Refresh registration status - now using event names instead of IDs
      setRegisteredEventIds(prev => new Set([...prev, event.name]));
      
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err) {
      setSaveStatus({ type: "error", message: "Network error. Please try again." });
    }
  }

  if (loading) {
    return (
      <div className="vm-container">
        <div className="vm-loading">Loading volunteers and events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vm-container">
        <div className="vm-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="vm-container">
      <div className="vm-header">
        <h1 className="vm-title">Volunteer Matching</h1>
        <p className="vm-subtitle">
          Select a volunteer to see eligible events based on their skills. Click "Match" on any event card to assign them.
        </p>
      </div>

      {saveStatus && (
        <div className={`vm-notification ${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}

      <div className="vm-layout">
        {/* Volunteer Selection Sidebar */}
        <aside className="vm-sidebar">
          <div className="vm-sidebar-header">
            <h2>Select Volunteer</h2>
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              className="vm-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="vm-volunteer-list">
            {filteredVolunteers.length === 0 ? (
              <div className="vm-empty">No volunteers found</div>
            ) : (
              filteredVolunteers.map((v) => (
                <VolunteerCard
                  key={v.id}
                  volunteer={v}
                  isSelected={selectedVolunteerId === v.id}
                  onClick={() => setSelectedVolunteerId(v.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Events Grid */}
        <main className="vm-main">
          {!selectedVolunteer ? (
            <div className="vm-empty-state">
              <h3>Select a volunteer to view eligible events</h3>
              <p>Choose a volunteer from the list on the left to see which events they qualify for based on their skills.</p>
            </div>
          ) : eligibleEvents.length === 0 ? (
            <div className="vm-empty-state">
              <h3>No Eligible Events</h3>
              <p>{selectedVolunteer.name} doesn't have the required skills for any available events.</p>
              {selectedVolunteer.skills?.length > 0 && (
                <p className="vm-skills-info">
                  Skills: {selectedVolunteer.skills.join(", ")}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="vm-main-header">
                <h2>Eligible Events for {selectedVolunteer.name}</h2>
                <span className="vm-event-count">{eligibleEvents.length} event{eligibleEvents.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="vm-events-grid">
                {eligibleEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={registeredEventIds.has(event.name)}
                    onMatch={() => handleMatch(event.id)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function VolunteerCard({ volunteer, isSelected, onClick }) {
  return (
    <div
      className={`volunteer-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="volunteer-card-header">
        <h3>{volunteer.name}</h3>
        {isSelected && <span className="selected-badge">Selected</span>}
      </div>
      <div className="volunteer-card-info">
        {volunteer.email && <p className="volunteer-email">📧 {volunteer.email}</p>}
        {volunteer.city && <p className="volunteer-city">📍 {volunteer.city}</p>}
      </div>
      {volunteer.skills?.length > 0 && (
        <div className="volunteer-skills">
          {volunteer.skills.map((skill, i) => (
            <span key={i} className="skill-tag">{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isRegistered, onMatch }) {
  const matchPercentage = event.reqLen > 0 
    ? Math.round((event.overlap / event.reqLen) * 100) 
    : 100;

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3>{event.name}</h3>
        <div className="event-match-badge" data-level={matchPercentage >= 80 ? 'high' : matchPercentage >= 50 ? 'medium' : 'low'}>
          {matchPercentage}% Match
        </div>
      </div>

      <div className="event-meta">
        <span className="event-date">📅 {event.date}</span>
        <span className="event-location">📍 {event.location}</span>
      </div>

      {event.description && (
        <p className="event-description">{event.description}</p>
      )}

      {event.capacity && (
        <p className="event-capacity">Capacity: {event.capacity} volunteers</p>
      )}

      {event.requiredSkills?.length > 0 && (
        <div className="event-skills">
          <strong>Required Skills ({event.overlap}/{event.reqLen}):</strong>
          <div className="skill-tags">
            {event.requiredSkills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <button 
        className={`event-match-btn ${isRegistered ? 'registered' : ''}`}
        onClick={onMatch}
        disabled={isRegistered}
      >
        {isRegistered ? '✓ Already Registered' : 'Match to This Event'}
      </button>
    </div>
  );
}