const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "PT4DB",
  password: process.env.DB_PASSWORD || "dbpass",
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log("📌 Conectado a PostgreSQL"))
  .catch(err => console.error("❌ Error de conexión a PostgreSQL", err));

module.exports = pool;
