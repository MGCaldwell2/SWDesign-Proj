import React, { useMemo, useState, useEffect } from "react";
import "./VolunteerMatching.css";

// Mock "Database" (replace with API/SQL later)
const MOCK_VOLUNTEERS = [
  { id: 1, name: "Alex Johnson", skills: ["First Aid", "Spanish", "Crowd Control"], availability: ["2025-10-01", "2025-10-05", "2025-10-12"], city: "Houston" },
  { id: 2, name: "Taylor Kim", skills: ["Data Entry", "Photography"], availability: ["2025-10-05", "2025-10-07"], city: "Houston" },
  { id: 3, name: "Mason Rivera", skills: ["Spanish", "Food Handling", "Logistics"], availability: ["2025-10-12", "2025-10-13", "2025-10-20"], city: "Katy" },
];

const MOCK_EVENTS = [
  { id: 101, name: "Community Health Fair", requiredSkills: ["First Aid", "Spanish"], date: "2025-10-01", location: "Houston", description: "Basic vitals, check-in, guiding attendees." },
  { id: 102, name: "Food Bank Drive", requiredSkills: ["Food Handling", "Logistics"], date: "2025-10-12", location: "Katy", description: "Sorting and distribution of non-perishables." },
  { id: 103, name: "City Marathon Volunteer Crew", requiredSkills: ["Crowd Control"], date: "2025-10-05", location: "Houston", description: "Course marshals and hydration stations." },
  { id: 104, name: "Community Newsletter Day", requiredSkills: ["Data Entry", "Photography"], date: "2025-10-07", location: "Houston", description: "Capture photos and digitize signups." },
];

export default function VolunteerMatching() {
  const [volunteers] = useState(MOCK_VOLUNTEERS);
  const [events] = useState(MOCK_EVENTS);


  function skillOverlap(volunteer, event) {
    const v = new Set(volunteer?.skills || []);
    const req = event?.requiredSkills || [];
    return req.reduce((acc, s) => acc + (v.has(s) ? 1 : 0), 0);
  }
  function isEligible(volunteer, event) {
    const reqLen = (event?.requiredSkills || []).length || 0;
    if (reqLen === 0) return true; 
    const overlap = skillOverlap(volunteer, event);
    return overlap > reqLen / 2;
  }

  function bestBySkills(volunteer, evts) {
    if (!volunteer || !evts?.length) return { event: null, meta: null };
    let best = { event: null, overlap: -1, reqLen: 0 };
    for (const e of evts) {
      const reqLen = (e.requiredSkills || []).length;
      const overlap = skillOverlap(volunteer, e);
      if (isEligible(volunteer, e) && overlap > best.overlap) {
        best = { event: e, overlap, reqLen };
      }
    }
    if (!best.event) return { event: null, meta: null };
    return { event: best.event, meta: { overlap: best.overlap, reqLen: best.reqLen } };
  }

  const [selectedVolunteerId, setSelectedVolunteerId] = useState(MOCK_VOLUNTEERS[0]?.id ?? null);
  const selectedVolunteer = useMemo(() => volunteers.find((v) => v.id === Number(selectedVolunteerId)), [selectedVolunteerId, volunteers]);
  const suggested = useMemo(() => bestBySkills(selectedVolunteer, events), [selectedVolunteer, events]);
  const [selectedEventId, setSelectedEventId] = useState(suggested.event?.id ?? "");

  useEffect(() => {
    setSelectedEventId(suggested.event?.id ?? "");
  }, [suggested.event?.id]);

  const [lastSaved, setLastSaved] = useState(null);
  function handleSave() {
    const event = events.find((e) => e.id === Number(selectedEventId));
    if (!selectedVolunteer || !event) return;
    if (!isEligible(selectedVolunteer, event)) return;

    setLastSaved({ volunteer: selectedVolunteer.name, event: event?.name, when: new Date().toLocaleString() });
  }

  const eligibleEventIds = useMemo(() => new Set(events.filter((e) => isEligible(selectedVolunteer, e)).map((e) => e.id)), [selectedVolunteer, events]);
  const canSave = selectedEventId && eligibleEventIds.has(Number(selectedEventId));

  return (
    <div className="vm-container">
      <div className="vm-card">
        <h1 className="vm-title">Volunteer Matching Form</h1>
        <p className="vm-subtitle">
          Matching is based on <strong>skills</strong> only. Choose an eligible event; pick based on your own availability. (Event date & location shown below.)
        </p>

        <div className="vm-field">
          <label>Volunteer Name</label>
          <select value={selectedVolunteerId ?? ""} onChange={(e) => setSelectedVolunteerId(e.target.value)}>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="vm-field">
          <label>Matched Event (Skills-Eligible)</label>
          <select
            value={selectedEventId ?? ""}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((e) => {
              const reqLen = (e.requiredSkills || []).length;
              const ov = skillOverlap(selectedVolunteer, e);
              const eligible = eligibleEventIds.has(e.id);
              const label = `${e.name} — ${e.date} (${e.location}) ${reqLen ? `• skills ${ov}/${reqLen}` : ""}`;
              return (
                <option key={e.id} value={e.id} disabled={!eligible} title={eligible ? "Eligible" : "Not eligible: majority of required skills missing"}>
                  {eligible ? label : `${label} — NOT ELIGIBLE`}
                </option>
              );
            })}
          </select>
        </div>

        <div className="vm-reasons">
          {suggested?.event ? (
            <div>
              Suggested by skills: <strong>{suggested.event.name}</strong>
              {typeof suggested?.meta?.overlap === "number" && (
                <span>{` • skills ${suggested.meta.overlap}/${suggested.meta.reqLen}`}</span>
              )}
            </div>
          ) : (
            <em>No events are skills-eligible for this volunteer.</em>
          )}
        </div>

        {selectedEventId && (
          <EventDetails event={events.find((e) => e.id === Number(selectedEventId))} />
        )}

        <div className="vm-actions">
          <button onClick={handleSave} disabled={!canSave}>
            Save Match
          </button>
          <button onClick={() => window.location.reload()}>Reset</button>
        </div>

        {lastSaved && (
          <div className="vm-saved">Saved: {lastSaved.volunteer} → {lastSaved.event} ({lastSaved.when})</div>
        )}
      </div>
    </div>
  );
}

function EventDetails({ event }) {
  if (!event) return null;
  return (
    <div className="vm-event-details">
      <div className="vm-event-title">{event.name}</div>
      <div className="vm-event-meta">{event.date} • {event.location}</div>
      {event.description && (<p>{event.description}</p>)}
      {event.requiredSkills?.length ? (
        <p>Required: {event.requiredSkills.join(", ")}</p>
      ) : null}
      <p style={{ fontSize: 12, color: "#a9a9a9", marginTop: 8 }}>
        Choose based on your availability; eligibility is determined by skills only.
      </p>
    </div>
  );
}