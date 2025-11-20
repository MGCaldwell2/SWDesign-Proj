import express from "express";
import pool from "../db.js";

const router = express.Router();

// CREATE EVENT
router.post("/", async (req, res) => {
  try {
    const { name, description, location, date, capacity, created_by } = req.body;
    const [result] = await pool.query(
      "INSERT INTO events (name, description, location, date, capacity, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, location, date, capacity || null, created_by || null]
    );
    const [newEvent] = await pool.query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    res.status(201).json({ message: "Event created successfully", event: newEvent[0] });
  } catch (err) {
  console.error("❌ Error creating event:", err.message);
  console.error(err);
  res.status(500).json({ message: err.message });
  }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving events" });
  }
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [eventId]);
    if (rows.length === 0) return res.status(404).json({ message: "Event not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving event" });
  }
});

// UPDATE EVENT
router.put("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, location, date, capacity } = req.body;
    const [result] = await pool.query(
      "UPDATE events SET name=?, description=?, location=?, date=?, capacity=? WHERE id=?",
      [name, description, location, date, capacity, eventId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Event not found" });

    const [updated] = await pool.query("SELECT * FROM events WHERE id=?", [eventId]);
    res.json({ message: "Event updated successfully", event: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating event" });
  }
});

// DELETE EVENT
router.delete("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const [result] = await pool.query("DELETE FROM events WHERE id=?", [eventId]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting event" });
  }
});

export default router;
