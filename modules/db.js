const { Pool } = require('pg');

// Configure the pool with your external Postgres connection string
const pool = new Pool({
  connectionString: 'postgresql://skillwrap_db_user:O3D526EAYy9bnOiaQ8RzlxnUWSpx1B0P@dpg-d59utb4hg0os73cjqhi0-a.oregon-postgres.render.com/skillwrap_db',
  ssl: {
    rejectUnauthorized: false // Needed for Render.com hosted Postgres
  }
});

console.log('succesfully connected to db')
// Export the pool to use in other parts of your app
module.exports = pool;
