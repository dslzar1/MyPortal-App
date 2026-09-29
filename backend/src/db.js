// This file creates ONE shared connection pool to Postgres, which every
// route file imports and reuses, rather than each route opening its own
// connection.
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL, but its certificate isn't in Node's default
  // trusted list, so we disable strict verification for this connection.
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
