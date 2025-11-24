import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/volunteers", async (req, res) => {
  try {
    console.log("Fetching volunteers...");
    const [rows] = await pool.query(`
      SELECT 
        u.id AS volunteer_id,
        up.id AS user_profile_id,
        u.display_name AS volunteer_name,
        up.city,
        up.full_name,
        u.email,
        u.phone,
        up.skills,
        up.availability
      FROM users u
      INNER JOIN UserProfile up ON up.user_id = u.id
      WHERE u.role = 'volunteer'
      ORDER BY u.id;
    `);

    const volunteers = rows.map(row => {
      let skills = [];
      try {
        if (row.skills) {
          const parsed = typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills;
          skills = Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {
        console.warn(`Failed to parse skills for volunteer ${row.volunteer_id}`);
      }

      let availability = [];
      try {
        if (row.availability) {
          const parsed = typeof row.availability === 'string' ? JSON.parse(row.availability) : row.availability;
          availability = Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {
        console.warn(`Failed to parse availability for volunteer ${row.volunteer_id}`);
      }

      return {
        id: row.volunteer_id,
        volunteersTableId: row.volunteers_table_id,
        name: row.volunteer_name || row.full_name,
        city: row.city,
        email: row.email,
        phone: row.phone,
        skills,
        availability
      };
    });

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
    // Get UserProfile to verify user has a profile
    const [[userProfile]] = await pool.query(
      "SELECT user_id FROM UserProfile WHERE user_id = ?",
      [volunteerId]
    );

    if (!userProfile) {
      return res.status(400).json({ error: "User profile not found. Please complete your profile first." });
    }

    // Get event details
    const [[event]] = await pool.query(
      "SELECT id, name FROM events WHERE id = ?",
      [eventId]
    );

    if (!event) {
      return res.status(400).json({ error: "Event not found" });
    }

    // Check if already registered in VolunteerHistory
    const [existing] = await pool.query(
      "SELECT 1 FROM VolunteerHistory WHERE user_id = ? AND event_description = ? LIMIT 1",
      [volunteerId, event.name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "Volunteer already registered for this event", alreadyRegistered: true });
    }

    // Insert into VolunteerHistory table (users.id = UserCredentials.user_id)
    await pool.query(
      `INSERT INTO VolunteerHistory (user_id, event_description, hours, status, volunteer_date) 
       VALUES (?, ?, 0, 'Completed', CURDATE())`,
      [volunteerId, event.name]
    );

    // Create notification for the user
    await pool.query(
      "INSERT INTO notifications (recipient_user_id, type, message, event_id) VALUES (?, 'assignment', ?, ?)",
      [volunteerId, `You've been registered for ${event.name}.`, eventId]
    );

    res.json({ success: true, message: "Volunteer successfully registered for event" });
  } catch (err) {
    console.error("Error creating match:", err);
    console.error("SQL Error details:", {
      code: err.code,
      errno: err.errno,
      sql: err.sql,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ error: "Failed to match volunteer", details: err.message });
  }
});

router.get("/volunteer/:volunteerId/registrations", async (req, res) => {
  const { volunteerId } = req.params;

  try {
    // Verify user has a profile
    const [[userProfile]] = await pool.query(
      "SELECT user_id FROM UserProfile WHERE user_id = ?",
      [volunteerId]
    );

    if (!userProfile) {
      return res.json({ eventNames: [] });
    }

    // Get registered events from VolunteerHistory
    const [registrations] = await pool.query(
      "SELECT event_description FROM VolunteerHistory WHERE user_id = ?",
      [volunteerId]
    );

    const eventNames = registrations.map(r => r.event_description);
    res.json({ eventNames });
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Volunteer completed history (events user has completed)
router.get("/volunteer/:volunteerId/history", async (req, res) => {
  const { volunteerId } = req.params;
  const idNum = Number(volunteerId);
  if (!Number.isInteger(idNum)) return res.status(400).json({ error: "Invalid volunteerId" });
  try {
    const [rows] = await pool.query(
      `SELECT log_id, event_description, hours, status, volunteer_date, timestamp
       FROM VolunteerHistory
       WHERE user_id = ?
       ORDER BY volunteer_date DESC, timestamp DESC`,
      [idNum]
    );
    // Parse and normalize
    const history = rows.map(r => ({
      id: r.log_id,
      name: r.event_description,
      hours: Number(r.hours) || 0,
      status: r.status,
      date: r.volunteer_date || null,
      timestamp: r.timestamp,
    }));
    res.json({ history });
  } catch (err) {
    console.error("Error fetching volunteer history:", err);
    res.status(500).json({ error: "Failed to fetch volunteer history" });
  }
});

// Add sample volunteer history (for testing/demo purposes)
router.post("/volunteer/:volunteerId/history/seed", async (req, res) => {
  const { volunteerId } = req.params;
  const idNum = Number(volunteerId);
  if (!Number.isInteger(idNum)) return res.status(400).json({ error: "Invalid volunteerId" });
  
  try {
    // Get some events to create history for
    const [events] = await pool.query(
      `SELECT id, name FROM events ORDER BY date DESC LIMIT 3`
    );
    
    if (events.length === 0) {
      return res.status(400).json({ error: "No events available to create history" });
    }
    
    // Create history records for each event
    const sampleHistory = events.map((event, index) => {
      const daysAgo = (index + 1) * 7; // 7, 14, 21 days ago
      const volunteerDate = new Date();
      volunteerDate.setDate(volunteerDate.getDate() - daysAgo);
      
      return [
        idNum,
        event.name,
        4 + index, // 4-6 hours
        'Completed',
        volunteerDate.toISOString().split('T')[0]
      ];
    });
    
    await pool.query(
      `INSERT INTO VolunteerHistory (user_id, event_description, hours, status, volunteer_date) 
       VALUES ?`,
      [sampleHistory]
    );
    
    res.json({ 
      success: true, 
      message: `Added ${sampleHistory.length} sample history records`,
      count: sampleHistory.length
    });
  } catch (err) {
    console.error("Error seeding volunteer history:", err);
    res.status(500).json({ error: "Failed to seed volunteer history" });
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
