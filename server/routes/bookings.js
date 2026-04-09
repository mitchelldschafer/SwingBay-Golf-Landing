import express from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const VALID_BAYS = ['Driving Range 1', 'Driving Range 2', 'VIP Simulator Bay'];

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'MHF-';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

function isValidDate(dateStr) {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

router.get('/availability', async (req, res) => {
  const { date } = req.query;
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ error: 'Valid date query parameter required (YYYY-MM-DD)' });
  }

  try {
    const result = await pool.query(
      `SELECT bay_name, time_slot FROM bookings WHERE booking_date = $1`,
      [date]
    );

    const taken = {};
    for (const bay of VALID_BAYS) {
      taken[bay] = [];
    }
    for (const row of result.rows) {
      if (taken[row.bay_name]) {
        taken[row.bay_name].push(row.time_slot);
      }
    }

    res.json({ date, taken });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Server error fetching availability' });
  }
});

router.post('/', async (req, res) => {
  const { bay_name, booking_date, time_slot, name, email, phone } = req.body;

  if (!bay_name || !booking_date || !time_slot || !name || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!VALID_BAYS.includes(bay_name)) {
    return res.status(400).json({ error: 'Invalid bay name' });
  }
  if (!isValidDate(booking_date)) {
    return res.status(400).json({ error: 'Invalid booking date' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const { default: jwt } = await import('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      // Not authenticated — booking still allowed without login
    }
  }

  let attempts = 0;
  let booking_ref;
  while (attempts < 5) {
    booking_ref = generateRef();
    const exists = await pool.query('SELECT id FROM bookings WHERE booking_ref = $1', [booking_ref]);
    if (exists.rows.length === 0) break;
    attempts++;
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookings (user_id, bay_name, booking_date, time_slot, name, email, phone, booking_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, booking_ref, bay_name, booking_date, time_slot, name, email, created_at`,
      [userId, bay_name, booking_date, time_slot, name.trim(), email.toLowerCase().trim(), phone.trim(), booking_ref]
    );

    res.status(201).json({ booking: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That slot was just taken. Please choose a different time.' });
    }
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error creating booking' });
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, booking_ref, bay_name, booking_date, time_slot, name, email, phone, created_at
       FROM bookings
       WHERE user_id = $1 AND booking_date >= CURRENT_DATE
       ORDER BY booking_date ASC, time_slot ASC`,
      [req.user.id]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('My bookings error:', err);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

export default router;
