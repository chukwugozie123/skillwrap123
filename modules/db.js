const { Pool } = require('pg');
require('dotenv').config();


const db = new Pool({
user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})
console.log("sucessfull conntect to db");

module.exports = db;




// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// // REAL connection test
// pool.query('SELECT 1')
//   .then(() => console.log('✅ DB connected successfully'))
//   .catch(err => console.error('❌ DB connection failed', err));

// module.exports = pool;
