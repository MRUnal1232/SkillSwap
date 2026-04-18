const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mrunal@0904',
  database: process.env.DB_NAME || 'skillswap',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
