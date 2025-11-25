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

// Mark a single notification as read (persist is_read = 1)
router.put("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // ownership check (could come from auth middleware later)
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_user_id = ? AND is_read = 0`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found or already read" });
    }

    res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Delete a notification
router.delete("/notifications/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // ownership check
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const [result] = await pool.query(
      `DELETE FROM notifications WHERE id = ? AND recipient_user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found or unauthorized" });
    }

    res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

router.post("/notifications", async (req, res) => {
  const { volunteerName, eventId, type, message, broadcast } = req.body;
  if (!type || !message)
    return res.status(400).json({ error: "type and message are required" });

  try {
    let recipients = [];

    // Send to a specific volunteer by name
    if (volunteerName) {
      // First try users table by display_name or email for broader coverage
      const [userRows] = await pool.query(
        `SELECT id AS userId FROM users WHERE display_name = ? OR email = ?`,
        [volunteerName, volunteerName]
      );
      if (userRows.length === 0) {
        // Fallback to legacy volunteers table
        const [rows] = await pool.query(
          `SELECT u.id AS userId
           FROM volunteers v
           JOIN users u ON u.id = v.user_id
           WHERE v.name = ?`,
          [volunteerName]
        );
        if (rows.length === 0)
          return res.status(404).json({ error: "Volunteer not found in users or volunteers" });
        recipients = rows.map(r => r.userId);
      } else {
        recipients = userRows.map(r => r.userId);
      }
    }

    // Send to all volunteers in an event (requires assignments table)
    else if (broadcast) {
      // Broadcast to all volunteer-role users
      const [rows] = await pool.query(`SELECT id AS userId FROM users WHERE role='volunteer'`);
      if (rows.length === 0) return res.status(404).json({ error: "No volunteer users found" });
      recipients = rows.map(r => r.userId);
    }
    else if (eventId) {
      // Derive recipients from event required skills; if none, send to all volunteer users
      const [skillRows] = await pool.query(
        `SELECT skill_id FROM event_skills WHERE event_id = ?`,
        [eventId]
      );

      if (skillRows.length === 0) {
        // No required skills specified: target all volunteers
        const [allVols] = await pool.query(`SELECT id AS userId FROM users WHERE role='volunteer'`);
        if (allVols.length === 0)
          return res.status(404).json({ error: "No volunteer users found for broadcast" });
        recipients = allVols.map(r => r.userId);
      } else {
        const skillIds = skillRows.map(r => r.skill_id);
        const placeholders = skillIds.map(() => '?').join(',');
        const [matchedVols] = await pool.query(
          `SELECT DISTINCT u.id AS userId
             FROM volunteers v
             JOIN users u ON u.id = v.user_id
             JOIN volunteer_skills vs ON vs.volunteer_id = v.id
            WHERE u.role='volunteer' AND vs.skill_id IN (${placeholders})`,
          skillIds
        );
        if (matchedVols.length === 0) {
          return res.status(404).json({ error: "No volunteers match required event skills" });
        }
        recipients = matchedVols.map(r => r.userId);
      }
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

    res.json({ success: true, count: recipients.length, message: "Notifications sent successfully" });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

export default router;
