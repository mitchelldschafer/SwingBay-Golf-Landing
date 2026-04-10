import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import bookingsRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { bootstrapSchema } from './db/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Public settings endpoint (no auth needed)
app.get('/api/settings', async (_req, res) => {
  try {
    const pool = (await import('./db/pool.js')).default;
    const result = await pool.query('SELECT key, value FROM site_settings ORDER BY key');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json({ settings });
  } catch (err) {
    console.error('Public settings error:', err);
    res.json({ settings: {} });
  }
});

// Serve frontend natively if we are in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // SPA fallback: serve index.html for any non-API request
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

bootstrapSchema()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to bootstrap database schema:', err);
    process.exit(1);
  });
