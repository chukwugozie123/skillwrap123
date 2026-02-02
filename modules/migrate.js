




const fs = require("fs");
const path = require("path");
const pool = require("../modules/db"); // adjust path if needed

const MIGRATIONS_DIR = path.join(__dirname, "../modules/migrations");

const runMigrations = async () => {
  console.log("🚀 Running migrations...");

  /* 1️⃣ ENSURE MIGRATIONS TABLE EXISTS */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_at TIMESTAMP DEFAULT NOW()
    );
  `);

  /* 2️⃣ FETCH ALREADY-RUN MIGRATIONS */
  const { rows: ranRows } = await pool.query("SELECT name FROM migrations");
  const ran = new Set(ranRows.map(r => r.name));

  /* 3️⃣ READ MIGRATION FILES */
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();

  /* 4️⃣ RUN PENDING MIGRATIONS */
  for (const file of files) {
    if (ran.has(file)) {
      console.log(`⏭ Skipping ${file}`);
      continue;
    }

    console.log(`▶ Running ${file}`);
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

    try {
      await pool.query("BEGIN");
      await pool.query(sql);
      await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
      await pool.query("COMMIT");
      console.log(`✅ Completed ${file}`);
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error(`❌ Failed ${file}`, err);
      throw err;
    }
  }

  /* 5️⃣ Log all columns in exchange_skills after migrations */
  try {
    const { rows: exchangeColumns } = await pool.query(`
   SELECT * FROM users
    `);

    console.log("📝 Columns in exchange_skills after migrations:");
    console.table(exchangeColumns);
  } catch (err) {
    console.error("❌ Failed to fetch columns of exchange_skills:", err);
  }

  console.log("🎉 Migrations complete");
};

module.exports = runMigrations;


      // SELECT column_name, data_type, is_nullable
      // FROM information_schema.columns
      // WHERE table_name = 'exchange_message'
      // ORDER BY ordinal_position;