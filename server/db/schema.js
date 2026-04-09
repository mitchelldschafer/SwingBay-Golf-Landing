import pool from './pool.js';

export async function bootstrapSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      hashed_password VARCHAR(255) NOT NULL,
      membership_status VARCHAR(50) DEFAULT 'none',
      stripe_customer_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      bay_name VARCHAR(100) NOT NULL,
      booking_date DATE NOT NULL,
      time_slot VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      booking_ref VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(bay_name, booking_date, time_slot)
    )
  `);

  console.log('Database schema verified.');
}
