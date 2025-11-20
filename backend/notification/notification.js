import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/notifications", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const [rows] = await pool.query(
      `
      SELECT n.id,
             n.recipient_user_id AS userId,
             n.type,
             n.message,
             n.event_id AS eventId,
             n.is_read AS isRead,
             n.created_at AS timestamp,
             e.name AS eventName
      FROM notifications n
      LEFT JOIN events e ON e.id = n.event_id
      WHERE n.recipient_user_id = ?
      ORDER BY n.created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

router.post("/notifications", async (req, res) => {
  const { volunteerName, eventId, type, message } = req.body;
  if (!type || !message)
    return res.status(400).json({ error: "type and message are required" });

  try {
    let recipients = [];

    // Send to a specific volunteer by name
    if (volunteerName) {
      const [rows] = await pool.query(
        `SELECT u.id AS userId
         FROM volunteers v
         JOIN users u ON u.id = v.user_id
         WHERE v.name = ?`,
        [volunteerName]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Volunteer not found" });
      recipients = rows.map((r) => r.userId);
    }

    // Send to all volunteers in an event
    else if (eventId) {
      const [rows] = await pool.query(
        `SELECT DISTINCT u.id AS userId
         FROM assignments a
         JOIN volunteers v ON v.id = a.volunteer_id
         JOIN users u ON u.id = v.user_id
         WHERE a.event_id = ?`,
        [eventId]
      );
      if (rows.length === 0)
        return res
          .status(404)
          .json({ error: "No volunteers assigned to this event" });
      recipients = rows.map((r) => r.userId);
    } else {
      return res
        .status(400)
        .json({ error: "Must provide volunteerName or eventId" });
    }

    // Insert notifications
    for (const userId of recipients) {
      await pool.query(
        `INSERT INTO notifications (recipient_user_id, type, message, event_id)
         VALUES (?, ?, ?, ?)`,
        [userId, type, message, eventId || null]
      );
    }

    res.json({
      success: true,
      count: recipients.length,
      message: "Notifications sent successfully",
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

export default router;
