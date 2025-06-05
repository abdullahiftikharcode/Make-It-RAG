const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool using the DATABASE_URL environment variable
const pool = mysql.createPool(process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get a promise-based interface to the pool
const promisePool = pool.promise();

// Log connection status
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.code, err.sqlMessage);
    return;
  }
  console.log('Connected to MySQL');
  connection.release();
});

module.exports = {
  pool,
  promisePool
}; 