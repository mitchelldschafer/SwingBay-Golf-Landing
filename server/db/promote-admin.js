import 'dotenv/config';
import pool from './pool.js';

const email = process.argv[2];

if (!email) {
  console.error('Error: Please specify the email address of the user to promote.');
  console.log('Usage: node server/db/promote-admin.js <email>');
  process.exit(1);
}

async function promote() {
  try {
    const res = await pool.query(
      'UPDATE users SET is_admin = true WHERE email = $1 RETURNING id, name, email, is_admin',
      [email]
    );

    if (res.rowCount === 0) {
      console.error(`Error: User with email "${email}" not found.`);
    } else {
      const user = res.rows[0];
      console.log(`Success: Promoted user "${user.name}" (${user.email}) to Admin!`);
    }
  } catch (err) {
    console.error('Database query error:', err.message);
  } finally {
    await pool.end();
  }
}

promote();
