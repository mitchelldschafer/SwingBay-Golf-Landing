import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, 'localhost', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
