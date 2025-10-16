import express from "express";
const router = express.Router();

// --- Mock Data ---
export const volunteers = [
  { id: 1, name: "Alex Johnson", skills: ["First Aid", "Spanish", "Crowd Control"], availability: ["2025-10-01", "2025-10-05", "2025-10-12"], city: "Houston" },
  { id: 2, name: "Taylor Kim", skills: ["Data Entry", "Photography"], availability: ["2025-10-05", "2025-10-07"], city: "Houston" },
  { id: 3, name: "Mason Rivera", skills: ["Spanish", "Food Handling", "Logistics"], availability: ["2025-10-12", "2025-10-13", "2025-10-20"], city: "Katy" },
];
export const events = [
  { id: 101, name: "Community Health Fair", requiredSkills: ["First Aid", "Spanish"], date: "2025-10-01", location: "Houston", description: "Basic vitals, check-in, guiding attendees." },
  { id: 102, name: "Food Bank Drive", requiredSkills: ["Food Handling", "Logistics"], date: "2025-10-12", location: "Katy", description: "Sorting and distribution of non-perishables." },
  { id: 103, name: "City Marathon Volunteer Crew", requiredSkills: ["Crowd Control"], date: "2025-10-05", location: "Houston", description: "Course marshals and hydration stations." },
  { id: 104, name: "Community Newsletter Day", requiredSkills: ["Data Entry", "Photography"], date: "2025-10-07", location: "Houston", description: "Capture photos and digitize signups." },
];

// GET /api/volunteers
router.get("/volunteers", (req, res) => {
  res.json(volunteers);
});

// GET /api/events
router.get("/events", (req, res) => {
  res.json(events);
});

// POST /api/match
router.post("/match", (req, res) => {
  const { volunteerId, eventId } = req.body;
  if (!volunteerId || !eventId) return res.status(400).json({ error: "volunteerId and eventId are required" });
  const volunteer = volunteers.find(v => v.id === Number(volunteerId));
  const event = events.find(e => e.id === Number(eventId));
  if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
  if (!event) return res.status(404).json({ error: "Event not found" });
  const overlap = event.requiredSkills.filter(skill => volunteer.skills.includes(skill)).length;
  const eligible = overlap > (event.requiredSkills.length / 2);
  if (!eligible) return res.status(400).json({ error: "Volunteer is not eligible for this event" });
  res.json({ matched: true, volunteer, event });
});

export default router;
