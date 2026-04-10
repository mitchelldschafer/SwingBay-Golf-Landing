import express from 'express';
import pool from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin auth
router.use(requireAdmin);

// ─── Dashboard Stats ────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalBookings, todayBookings, totalUsers, activeMembers] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'"),
      pool.query("SELECT COUNT(*) FROM bookings WHERE booking_date = $1 AND status = 'confirmed'", [today]),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM users WHERE membership_status != 'none'"),
    ]);

    // Bookings this week
    const weekBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE booking_date >= $1 AND booking_date <= ($1::date + interval '6 days') AND status = 'confirmed'",
      [today]
    );

    res.json({
      totalBookings: parseInt(totalBookings.rows[0].count),
      todayBookings: parseInt(todayBookings.rows[0].count),
      weekBookings: parseInt(weekBookings.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeMembers: parseInt(activeMembers.rows[0].count),
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// ─── Today's Schedule ───────────────────────────────────────────────
router.get('/schedule', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT b.id, b.bay_name, b.time_slot, b.name, b.email, b.phone, b.booking_ref, b.status
       FROM bookings b
       WHERE b.booking_date = $1
       ORDER BY b.bay_name, b.time_slot`,
      [date]
    );
    res.json({ date, bookings: result.rows });
  } catch (err) {
    console.error('Schedule error:', err);
    res.status(500).json({ error: 'Server error fetching schedule' });
  }
});

// ─── All Bookings (with filters) ────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const { from, to, bay, status, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = [];
    let params = [];
    let idx = 1;

    if (from) {
      where.push(`booking_date >= $${idx}`);
      params.push(from);
      idx++;
    }
    if (to) {
      where.push(`booking_date <= $${idx}`);
      params.push(to);
      idx++;
    }
    if (bay) {
      where.push(`bay_name = $${idx}`);
      params.push(bay);
      idx++;
    }
    if (status) {
      where.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM bookings ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT id, booking_ref, bay_name, booking_date, time_slot, name, email, phone, status, created_at
       FROM bookings ${whereClause}
       ORDER BY booking_date DESC, time_slot ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      bookings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Admin bookings error:', err);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

// ─── Update Booking ─────────────────────────────────────────────────
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bay_name, time_slot, status } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (bay_name) {
      updates.push(`bay_name = $${idx}`);
      params.push(bay_name);
      idx++;
    }
    if (time_slot) {
      updates.push(`time_slot = $${idx}`);
      params.push(time_slot);
      idx++;
    }
    if (status) {
      updates.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That time slot is already taken' });
    }
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Server error updating booking' });
  }
});

// ─── Cancel Booking ─────────────────────────────────────────────────
router.delete('/bookings/:id', async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Server error cancelling booking' });
  }
});

// ─── All Users ──────────────────────────────────────────────────────
router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, membership_status, is_admin, created_at,
              (SELECT COUNT(*) FROM bookings WHERE user_id = users.id AND status = 'confirmed') as booking_count
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// ─── Update User ────────────────────────────────────────────────────
router.patch('/users/:id', async (req, res) => {
  try {
    const { membership_status, is_admin } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;

    if (membership_status !== undefined) {
      updates.push(`membership_status = $${idx}`);
      params.push(membership_status);
      idx++;
    }
    if (is_admin !== undefined) {
      updates.push(`is_admin = $${idx}`);
      params.push(is_admin);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, membership_status, is_admin, created_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

// ─── Bays ───────────────────────────────────────────────────────────
router.get('/bays', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bays ORDER BY sort_order');
    res.json({ bays: result.rows });
  } catch (err) {
    console.error('Admin bays error:', err);
    res.status(500).json({ error: 'Server error fetching bays' });
  }
});

router.patch('/bays/:id', async (req, res) => {
  try {
    const { is_active, name } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;

    if (is_active !== undefined) {
      updates.push(`is_active = $${idx}`);
      params.push(is_active);
      idx++;
    }
    if (name) {
      updates.push(`name = $${idx}`);
      params.push(name);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE bays SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bay not found' });
    }

    res.json({ bay: result.rows[0] });
  } catch (err) {
    console.error('Update bay error:', err);
    res.status(500).json({ error: 'Server error updating bay' });
  }
});

// ─── Site Settings ──────────────────────────────────────────────────
router.get('/settings', async (_req, res) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM site_settings ORDER BY key');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json({ settings });
  } catch (err) {
    console.error('Admin settings error:', err);
    res.status(500).json({ error: 'Server error fetching settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, String(value)]
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Server error updating settings' });
  }
});

export default router;
