// const { Pool } = require('pg');
// require('dotenv').config();


// const db = new Pool({
// user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
//  })

// Instead of ES module import
// import pkg from 'pg';

// Use CommonJS require
const { Pool } = require('pg');

// Example usage
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

module.exports = pool;
