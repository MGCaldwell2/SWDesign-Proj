import express from "express";
import fs from "fs";
import path from "path";
import { volunteers, events } from "../volunteermatching/volunteermatching.js";

const router = express.Router();

// file to store notification data
const dataDir = path.join(process.cwd(), "data");
const notifFile = path.join(dataDir, "notifications.json");

//  load notifications
let notifications = [];
function ensureDataFile() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(notifFile)) fs.writeFileSync(notifFile, JSON.stringify([{ id: 1, userId: 1, type: "assignment", message: "Assigned to Community Health Fair.", eventId: 101, isRead: false, timestamp: new Date().toISOString() }], null, 2));
    const raw = fs.readFileSync(notifFile, "utf8");
    notifications = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Failed to initialize notifications file:", err);
    notifications = [];
  }
}

function writeNotifications() {
  try {
    fs.writeFileSync(notifFile, JSON.stringify(notifications, null, 2));
  } catch (err) {
    console.error("Failed to write notifications file:", err);
  }
}

ensureDataFile();

// GET /api/notifications
router.get("/notifications", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    const raw = fs.readFileSync(notifFile, "utf8");
    notifications = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Failed to read notifications file:", err);
    return res.status(500).json({ error: "Failed to read notifications" });
  }
  res.json(notifications.filter(n => n.userId === Number(userId)));
});

// POST /api/notifications
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
    recipients = volunteers.filter(v => v.skills.some(skill => event.requiredSkills.includes(skill)));
    if (recipients.length === 0) return res.status(404).json({ error: "No eligible volunteers for this event" });
  } else {
    return res.status(400).json({ error: "Must provide volunteerName or eventId" });
  }

  try {
    const raw = fs.readFileSync(notifFile, "utf8");
    notifications = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Failed to read notifications file before writing:", err);
    notifications = [];
  }

  const newNotifs = recipients.map(v => {
    const nextId = notifications.length ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    const notif = {
      id: nextId,
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

  writeNotifications();
  res.json({ success: true, notifications: newNotifs });
});

export default router;
