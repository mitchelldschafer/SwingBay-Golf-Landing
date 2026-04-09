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
  console.log('Database schema verified.');
}
