import pool from './pool.js';

export async function bootstrapSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      hashed_password VARCHAR(255) NOT NULL,
      membership_status VARCHAR(50) DEFAULT 'none',
      is_admin BOOLEAN DEFAULT false,
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
        ALTER TABLE bookings ADD COLUMN booking_ref VARCHAR(20);
      END IF;
    END $$
  `);

  await pool.query(`
    DO $$ DECLARE
      chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      ref TEXT;
      rec RECORD;
    BEGIN
      FOR rec IN SELECT id FROM bookings WHERE booking_ref IS NULL OR booking_ref = '' LOOP
        LOOP
          ref := 'MHF-';
          FOR i IN 1..6 LOOP
            ref := ref || substr(chars, floor(random() * length(chars) + 1)::int, 1);
          END LOOP;
          EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE booking_ref = ref);
        END LOOP;
        UPDATE bookings SET booking_ref = ref WHERE id = rec.id;
      END LOOP;
    END $$
  `);

  await pool.query(`
    ALTER TABLE bookings
      ALTER COLUMN booking_ref SET NOT NULL
  `);

  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'bookings_booking_ref_key'
          AND conrelid = 'bookings'::regclass
      ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_booking_ref_key UNIQUE (booking_ref);
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

  // Add is_admin column if missing
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_admin'
      ) THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
      END IF;
    END $$
  `);

  // Add status column to bookings if missing
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'status'
      ) THEN
        ALTER TABLE bookings ADD COLUMN status VARCHAR(20) DEFAULT 'confirmed';
      END IF;
    END $$
  `);

  // Bays table for admin management
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bays (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0
    )
  `);

  // Seed default bays if table is empty
  await pool.query(`
    INSERT INTO bays (name, sort_order)
    SELECT name, sort_order FROM (VALUES
      ('Driving Range 1', 1),
      ('Driving Range 2', 2),
      ('VIP Simulator Bay', 3)
    ) AS defaults(name, sort_order)
    WHERE NOT EXISTS (SELECT 1 FROM bays)
  `);

  console.log('Database schema verified.');
}
