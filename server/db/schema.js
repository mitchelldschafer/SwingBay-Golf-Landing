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

  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'booking_ref'
      ) THEN
        ALTER TABLE bookings ADD COLUMN booking_ref VARCHAR(20) UNIQUE NOT NULL DEFAULT '';
      END IF;
    END $$
  `);

  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'bookings_bay_name_booking_date_time_slot_key'
          AND conrelid = 'bookings'::regclass
      ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_bay_name_booking_date_time_slot_key
          UNIQUE (bay_name, booking_date, time_slot);
      END IF;
    END $$
  `);

  console.log('Database schema verified.');
}
