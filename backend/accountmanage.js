import pool from "./db.js";

// Basic connectivity check (runs once at startup)
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ AccountManage: Connected to MySQL");
  } catch (err) {
    console.error("❌ AccountManage: MySQL connection failed:", err.message || err);
  }
})();

// Helper to safely parse JSON columns
function safeParseJSON(value, defaultValue = []) {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

// GET /api/accounts/account?user_id=123
export const getAccount = async (req, res) => {
  const userId = Number(req.query.user_id || req.body?.user_id);
  if (!userId) return res.status(400).json({ error: "user_id is required" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM UserProfile WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).json({ error: "Profile not found" });

    const profile = rows[0];
    profile.skills = safeParseJSON(profile.skills);
    profile.availability = safeParseJSON(profile.availability);

    res.json(profile);
  } catch (err) {
    console.error("getAccount error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// PUT /api/accounts/account (update existing profile by user_id)
export const updateAccount = async (req, res) => {
  const userId = Number(req.body?.user_id);
  if (!userId) return res.status(400).json({ error: "user_id is required" });
  const {
    full_name,
    address1,
    address2,
    city,
    state,
    zipcode,
    skills,
    preferences,
    availability,
  } = req.body || {};

  try {
    const [existingRows] = await pool.query(
      "SELECT * FROM UserProfile WHERE user_id = ?",
      [userId]
    );
    if (!existingRows.length) return res.status(404).json({ error: "Profile not found" });

    const existing = existingRows[0];
    const skillsString = JSON.stringify(skills ?? safeParseJSON(existing.skills));
    const availabilityString = JSON.stringify(availability ?? safeParseJSON(existing.availability));

    await pool.query(
      `UPDATE UserProfile 
       SET full_name=?, address1=?, address2=?, city=?, state=?, zipcode=?, skills=?, preferences=?, availability=?
       WHERE user_id=?`,
      [
        full_name ?? existing.full_name,
        address1 ?? existing.address1,
        address2 ?? existing.address2,
        city ?? existing.city,
        state ?? existing.state,
        zipcode ?? existing.zipcode,
        skillsString,
        preferences ?? existing.preferences,
        availabilityString,
        userId,
      ]
    );

    const [updatedRows] = await pool.query(
      "SELECT * FROM UserProfile WHERE user_id = ?",
      [userId]
    );
    const updated = updatedRows[0];
    updated.skills = safeParseJSON(updated.skills);
    updated.availability = safeParseJSON(updated.availability);
    res.json(updated);
  } catch (err) {
    console.error("updateAccount error:", err);
    res.status(500).json({ error: "Database update failed", details: err.message });
  }
};
// POST /api/accounts (create profile for user)
export const createAccount = async (req, res) => {
  const userId = Number(req.body?.user_id);
  if (!userId) return res.status(400).json({ error: "user_id is required" });
  const {
    full_name = "",
    address1 = "",
    address2 = "",
    city = "",
    state = "",
    zipcode = "",
    skills = [],
    preferences = "",
    availability = [],
  } = req.body || {};

  try {
    // If profile already exists, treat as update instead of failing
    const [existing] = await pool.query(
      "SELECT id FROM UserProfile WHERE user_id=?",
      [userId]
    );
    const skillsString = JSON.stringify(skills);
    const availabilityString = JSON.stringify(availability);

    if (existing.length) {
      await pool.query(
        `UPDATE UserProfile SET full_name=?, address1=?, address2=?, city=?, state=?, zipcode=?, skills=?, preferences=?, availability=? WHERE user_id=?`,
        [
          full_name,
          address1,
          address2,
          city,
          state,
          zipcode,
          skillsString,
          preferences,
          availabilityString,
          userId,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO UserProfile (user_id, full_name, address1, address2, city, state, zipcode, skills, preferences, availability)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          full_name,
          address1,
          address2,
          city,
          state,
          zipcode,
          skillsString,
          preferences,
          availabilityString,
        ]
      );
    }

    const [rows] = await pool.query("SELECT * FROM UserProfile WHERE user_id=?", [userId]);
    const profile = rows[0];
    profile.skills = safeParseJSON(profile.skills);
    profile.availability = safeParseJSON(profile.availability);
    res.status(existing.length ? 200 : 201).json(profile);
  } catch (err) {
    console.error("createAccount error:", err);
    res.status(500).json({ error: "Database write failed", details: err.message });
  }
};

import express from "express";
const router = express.Router();

// Dedicated endpoints
router.get("/account", getAccount); // expects user_id query param
router.put("/account", updateAccount); // expects user_id in body
router.post("/", createAccount); // create/update profile with user_id in body

export default router;