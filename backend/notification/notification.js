import express from "express";
const router = express.Router();

// --- Mock Data ---
let notifications = [
  { id: 1, userId: 1, type: "assignment", message: "Assigned to Community Health Fair.", eventId: 101, isRead: false, timestamp: new Date().toISOString() },
];

// GET /api/notifications
router.get("/notifications", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  res.json(notifications.filter(n => n.userId === Number(userId)));
});

// POST /api/notifications
import { volunteers, events } from "../volunteermatching/volunteermatching.js";
router.post("/notifications", (req, res) => {
  const { volunteerName, eventId, type, message } = req.body;
  if (!type || !message) return res.status(400).json({ error: "type and message are required" });
  if (typeof message !== "string" || message.length > 200) return res.status(400).json({ error: "Message must be a string up to 200 chars" });
  if (!["assignment", "update", "reminder"].includes(type)) return res.status(400).json({ error: "Invalid notification type" });

  let recipients = [];
  if (volunteerName) {
    const v = volunteers.find(v => v.name === volunteerName);
    if (!v) return res.status(404).json({ error: "Volunteer not found" });
    recipients = [v];
  } else if (eventId) {
    const event = events.find(e => String(e.id) === String(eventId));
    if (!event) return res.status(404).json({ error: "Event not found" });
    // For demo, send to all volunteers (since we don't have event assignments)
    recipients = volunteers.filter(v => v.skills.some(skill => event.requiredSkills.includes(skill)));
    if (recipients.length === 0) return res.status(404).json({ error: "No eligible volunteers for this event" });
  } else {
    return res.status(400).json({ error: "Must provide volunteerName or eventId" });
  }

  const newNotifs = recipients.map(v => {
    const notif = {
      id: notifications.length + 1,
      userId: v.id,
      type,
      message,
      eventId: eventId ? Number(eventId) : null,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    notifications.push(notif);
    return notif;
  });
  res.json({ success: true, notifications: newNotifs });
});

export default router;
