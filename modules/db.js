// const { Pool } = require('pg');
// require('dotenv').config(); // Load .env variables

// // Configure the pool using the environment variable
// const pool = new Pool({
//   connectionString: 'postgresql:skillwrap_db_user:O3D526EAYy9bnOiaQ8RzlxnUWSpx1B0P@dpg-d59utb4hg0os73cjqhi0-a.oregon-postgres.render.com/skillwrap_db',
//   // process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false // Needed for Render.com hosted Postgres
//   }
// });

  
// console.log('Successfully connected to DB');

// // Export the pool to use in other files


require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// REAL connection test
pool.query('SELECT 1')
  .then(() => console.log('✅ DB connected successfully'))
  .catch(err => console.error('❌ DB connection failed', err));

module.exports = pool;
