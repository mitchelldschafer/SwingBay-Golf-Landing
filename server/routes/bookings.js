import express from 'express';
import pool from '../db/pool.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const VALID_BAYS = ['Driving Range 1', 'Driving Range 2', 'VIP Simulator Bay'];

const VALID_TIME_SLOTS = [
  '11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM',
  '5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM',
];

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'MHF-';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

function isValidDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

const DENVER_TZ = 'America/Denver';

function formatDenverDate(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DENVER_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function denverDateStr() {
  return formatDenverDate(new Date());
}

function denverDateOffsetStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDenverDate(d);
}

function denverNowHour() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DENVER_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
  return h + m / 60;
}

router.get('/availability', async (req, res) => {
  const { date } = req.query;
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ error: 'Valid date query parameter required (YYYY-MM-DD)' });
  }

  const todayStr = denverDateStr();
  const maxStr = denverDateOffsetStr(6);
  if (date < todayStr || date > maxStr) {
    return res.status(400).json({ error: 'Availability can only be checked within the next 7 days' });
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
  if (!VALID_TIME_SLOTS.includes(time_slot)) {
    return res.status(400).json({ error: 'Invalid time slot' });
  }
  if (!isValidDate(booking_date)) {
    return res.status(400).json({ error: 'Invalid booking date' });
  }

  const todayStr = denverDateStr();
  const maxStr = denverDateOffsetStr(6);
  if (booking_date < todayStr || booking_date > maxStr) {
    return res.status(400).json({ error: 'Booking date must be within the next 7 days' });
  }

  const decoded = optionalAuth(req);
  const userId = decoded ? decoded.id : null;

  let attempts = 0;
  let booking_ref;
  while (attempts < 5) {
    const candidate = generateRef();
    const exists = await pool.query('SELECT id FROM bookings WHERE booking_ref = $1', [candidate]);
    if (exists.rows.length === 0) {
      booking_ref = candidate;
      break;
    }
    attempts++;
  }
  if (!booking_ref) {
    console.error('Booking ref generation exhausted after 5 attempts');
    return res.status(500).json({ error: 'Unable to generate booking reference. Please try again.' });
  }

  let insertResult;
  let insertAttempts = 0;
  while (insertAttempts < 3) {
    try {
      insertResult = await pool.query(
        `INSERT INTO bookings (user_id, bay_name, booking_date, time_slot, name, email, phone, booking_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, booking_ref, bay_name, booking_date, time_slot, name, email, created_at`,
        [userId, bay_name, booking_date, time_slot, name.trim(), email.toLowerCase().trim(), phone.trim(), booking_ref]
      );
      break;
    } catch (err) {
      if (err.code === '23505') {
        const isSlotConflict = err.constraint && err.constraint.includes('bay_name');
        if (isSlotConflict) {
          return res.status(409).json({ error: 'That slot was just taken. Please choose a different time.' });
        }
        booking_ref = generateRef();
        insertAttempts++;
        continue;
      }
      console.error('Booking error:', err);
      return res.status(500).json({ error: 'Server error creating booking' });
    }
  }

  if (!insertResult) {
    return res.status(500).json({ error: 'Unable to generate unique booking reference. Please try again.' });
  }

  res.status(201).json({ booking: insertResult.rows[0] });
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const todayStr = denverDateStr();
    const result = await pool.query(
      `SELECT id, booking_ref, bay_name, booking_date, time_slot, name, email, phone, created_at,
              ARRAY_POSITION($3::text[], time_slot) AS slot_order
       FROM bookings
       WHERE user_id = $1 AND booking_date >= $2::date
       ORDER BY booking_date ASC, slot_order ASC`,
      [req.user.id, todayStr, VALID_TIME_SLOTS]
    );

    const currentHour = denverNowHour();

    const upcoming = result.rows.filter(b => {
      const dateStr = new Date(b.booking_date).toISOString().split('T')[0];
      if (dateStr > todayStr) return true;
      const slotHour = 11 + (b.slot_order - 1);
      return slotHour >= currentHour;
    });

    res.json({ bookings: upcoming });
  } catch (err) {
    console.error('My bookings error:', err);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

export default router;
