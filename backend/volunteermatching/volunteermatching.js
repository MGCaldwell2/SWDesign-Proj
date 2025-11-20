import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/volunteers", async (req, res) => {
  try {
    console.log("Fetching volunteers...");
    const [rows] = await pool.query(`
      SELECT 
        v.id AS volunteer_id,
        v.name AS volunteer_name,
        v.city,
        v.bio,
        v.email,
        v.phone,
        COALESCE(GROUP_CONCAT(DISTINCT s.name SEPARATOR ', '), '') AS skills
      FROM volunteers v
      LEFT JOIN volunteer_skills vs ON vs.volunteer_id = v.id
      LEFT JOIN skills s ON s.id = vs.skill_id
      GROUP BY v.id
      ORDER BY v.id;
    `);

    const volunteers = rows.map(row => ({
      id: row.volunteer_id,
      name: row.volunteer_name,
      city: row.city,
      bio: row.bio,
      email: row.email,
      phone: row.phone,
      skills: row.skills ? row.skills.split(',').map(s => s.trim()) : []
    }));

    console.log(`Found ${volunteers.length} volunteers`);
    res.json(volunteers);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ error: "Failed to load volunteers" });
  }
});

router.get("/events", async (req, res) => {
  try {
    console.log("Fetching events...");
    const [rows] = await pool.query(`
      SELECT 
        e.id AS event_id,
        e.name AS event_name,
        e.description,
        e.date,
        e.location,
        e.capacity,
        COALESCE(GROUP_CONCAT(DISTINCT s.name SEPARATOR ', '), '') AS required_skills
      FROM events e
      LEFT JOIN event_skills es ON es.event_id = e.id
      LEFT JOIN skills s ON s.id = es.skill_id
      GROUP BY e.id
      ORDER BY e.date ASC;
    `);

    const events = rows.map(row => ({
      id: row.event_id,
      name: row.event_name,
      description: row.description,
      date: row.date ? new Date(row.date).toISOString().split("T")[0] : null,
      location: row.location,
      capacity: row.capacity,
      requiredSkills: row.required_skills
        ? row.required_skills.split(",").map(s => s.trim()).filter(Boolean)
        : []
    }));

    console.log(`Found ${events.length} events`);
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

router.post("/match", async (req, res) => {
  const { volunteerId, eventId } = req.body;
  if (!volunteerId || !eventId) {
    return res.status(400).json({ error: "volunteerId and eventId are required" });
  }

  try {
    // Check if already assigned
    const [existing] = await pool.query(
      "SELECT id FROM assignments WHERE volunteer_id = ? AND event_id = ?",
      [volunteerId, eventId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Volunteer already assigned to this event" });
    }

    // Insert into assignments
    await pool.query(
      "INSERT INTO assignments (volunteer_id, event_id, status) VALUES (?, ?, 'assigned')",
      [volunteerId, eventId]
    );

    // Find linked user for volunteer
    const [[volUser]] = await pool.query(
      "SELECT user_id FROM volunteers WHERE id = ?",
      [volunteerId]
    );

    // Create notification for that user
    if (volUser?.user_id) {
      await pool.query(
        "INSERT INTO notifications (recipient_user_id, type, message, event_id) VALUES (?, 'assignment', ?, ?)",
        [volUser.user_id, "You’ve been assigned to an event.", eventId]
      );
    }

    res.json({ success: true, message: "Volunteer successfully matched to event" });
  } catch (err) {
    console.error("Error creating match:", err);
    res.status(500).json({ error: "Failed to match volunteer" });
  }
});

router.get("/events/:eventId/matches", async (req, res) => {
  const { eventId } = req.params;

  try {
    const [[event]] = await pool.query(`
      SELECT e.*, 
             COUNT(DISTINCT a.volunteer_id) as current_assignments
      FROM events e
      LEFT JOIN assignments a ON a.event_id = e.id AND a.status NOT IN ('declined', 'cancelled')
      WHERE e.id = ?
      GROUP BY e.id
    `, [eventId]);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.capacity && event.current_assignments >= event.capacity) {
      return res.status(400).json({ error: "Event is already at capacity" });
    }

    const [volunteers] = await pool.query(`
      WITH event_required_skills AS (
        SELECT skill_id, required_level FROM event_skills WHERE event_id = ?
      ),
      qualified_volunteers AS (
        SELECT 
          v.id as volunteer_id,
          v.name,
          v.city,
          v.email,
          v.phone,
          v.bio,
          COUNT(DISTINCT ers.skill_id) as matched_skills,
          GROUP_CONCAT(DISTINCT s.name) as skills
        FROM volunteers v
        JOIN volunteer_skills vs ON vs.volunteer_id = v.id
        JOIN skills s ON s.id = vs.skill_id
        LEFT JOIN event_required_skills ers ON ers.skill_id = vs.skill_id
          AND CASE 
              WHEN ers.required_level = 'advanced' THEN vs.proficiency = 'advanced'
              WHEN ers.required_level = 'intermediate' THEN vs.proficiency IN ('intermediate', 'advanced')
              ELSE vs.proficiency IN ('basic', 'intermediate', 'advanced')
          END
        LEFT JOIN assignments a ON a.volunteer_id = v.id 
          AND a.event_id = ?
          AND a.status NOT IN ('declined', 'cancelled')
        WHERE a.id IS NULL
        GROUP BY v.id
      )
      SELECT *,
             (SELECT COUNT(*) FROM event_required_skills) as total_required_skills
      FROM qualified_volunteers
      HAVING matched_skills >= total_required_skills
      ORDER BY matched_skills DESC, name ASC
    `, [eventId, eventId]);

    res.json({
      event: {
        ...event,
        remainingCapacity: event.capacity
          ? event.capacity - event.current_assignments
          : null,
      },
      matches: volunteers.map(v => ({
        id: v.volunteer_id,
        name: v.name,
        city: v.city,
        email: v.email,
        phone: v.phone,
        bio: v.bio,
        skills: v.skills ? v.skills.split(",") : [],
        matchedSkills: v.matched_skills,
      })),
    });
  } catch (err) {
    console.error("Error finding matches:", err);
    res.status(500).json({ error: "Failed to find matches" });
  }
});

export default router;
