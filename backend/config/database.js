const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL");
    client.release();
    return true;
  } catch (err) {
    console.error("Database connection error:", err.stack);
    return false;
  }
};

const initializeTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_table (
        user_pseudo_id VARCHAR(255) PRIMARY KEY,
        install_date DATE,
        install_timestamp BIGINT,
        platform VARCHAR(50),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session_table (
        session_id VARCHAR(255) PRIMARY KEY,
        user_pseudo_id VARCHAR(255) REFERENCES user_table(user_pseudo_id),
        session_date DATE,
        session_timestamp BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables initialized successfully");
  } catch (err) {
    console.error("Error initializing tables:", err.stack);
    throw err;
  } finally {
    client.release();
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error("Error executing query:", err.stack);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  initializeTables,
};
