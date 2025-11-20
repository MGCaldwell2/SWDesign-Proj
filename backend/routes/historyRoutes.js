import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all volunteer history (grouped by volunteer)
router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        vh.id,
        vh.volunteer_id,
        v.name,
        v.email,
        v.phone,
        vh.event_id,
        e.name AS event_name,
        vh.action_type,
        vh.details,
        vh.created_at
      FROM volunteer_history vh
      LEFT JOIN volunteers v ON v.id = vh.volunteer_id
      LEFT JOIN events e ON e.id = vh.event_id
      ORDER BY vh.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history' });
  }
});

// GET history for a specific volunteer
router.get('/history/volunteer/:volunteerId', async (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT 
        vh.id,
        vh.volunteer_id,
        v.name,
        v.email,
        v.phone,
        vh.event_id,
        e.name AS event_name,
        vh.action_type,
        vh.details,
        vh.created_at
      FROM volunteer_history vh
      LEFT JOIN volunteers v ON v.id = vh.volunteer_id
      LEFT JOIN events e ON e.id = vh.event_id
      WHERE vh.volunteer_id = ?
      ORDER BY vh.created_at DESC
    `, [volunteerId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history' });
  }
});

// POST new volunteer history entry
router.post('/history', async (req, res) => {
  try {
    const { volunteer_id, event_id, action_type, details, created_by } = req.body;

    if (!volunteer_id || !action_type) {
      return res.status(400).json({ error: 'volunteer_id and action_type are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO volunteer_history 
      (volunteer_id, event_id, action_type, details, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [volunteer_id, event_id || null, action_type, JSON.stringify(details), created_by || null]);

    const [newEntry] = await pool.query(`
      SELECT 
        vh.id,
        vh.volunteer_id,
        v.name,
        v.email,
        v.phone,
        vh.event_id,
        e.name AS event_name,
        vh.action_type,
        vh.details,
        vh.created_at
      FROM volunteer_history vh
      LEFT JOIN volunteers v ON v.id = vh.volunteer_id
      LEFT JOIN events e ON e.id = vh.event_id
      WHERE vh.id = ?
    `, [result.insertId]);

    res.status(201).json(newEntry[0]);
  } catch (error) {
    console.error('Error creating volunteer history entry:', error);
    res.status(500).json({ error: 'Failed to create volunteer history entry' });
  }
});

// GET summary statistics
router.get('/history/summary', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT vh.volunteer_id) as total_volunteers,
        COUNT(vh.id) as total_events,
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(vh.details, '$.hours')) AS DECIMAL(10,2))) as total_hours
      FROM volunteer_history vh
      WHERE vh.action_type = 'hours_logged'
    `);

    res.json(stats[0] || { total_volunteers: 0, total_events: 0, total_hours: 0 });
  } catch (error) {
    console.error('Error fetching history summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET volunteer summary (grouped totals)
router.get('/history/volunteer-summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.id,
        v.name,
        v.email,
        v.phone,
        COUNT(vh.id) as event_count,
        COALESCE(SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(vh.details, '$.hours')) AS DECIMAL(10,2))), 0) as total_hours
      FROM volunteers v
      LEFT JOIN volunteer_history vh ON vh.volunteer_id = v.id AND vh.action_type = 'hours_logged'
      GROUP BY v.id, v.name, v.email, v.phone
      HAVING event_count > 0
      ORDER BY v.name ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching volunteer summary:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer summary' });
  }
});

// DELETE history entry (admin only)
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM volunteer_history WHERE id = ?', [id]);
    
    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

export default router;
