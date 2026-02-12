import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    return;
  }
  console.log('✅ Database connected successfully');
  release();
});

export default pool;
