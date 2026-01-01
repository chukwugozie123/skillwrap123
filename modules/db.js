const { Pool } = require('pg');
require('dotenv').config(); // Load .env variables

// Configure the pool using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Needed for Render.com hosted Postgres
  }
});

console.log('Successfully connected to DB');

// Export the pool to use in other files
module.exports = pool;
