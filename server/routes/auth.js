import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashed_password = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, hashed_password, membership_status)
       VALUES ($1, $2, $3, 'none')
       RETURNING id, name, email, membership_status, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashed_password]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        membership_status: user.membership_status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, hashed_password, membership_status, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        membership_status: user.membership_status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, membership_status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
