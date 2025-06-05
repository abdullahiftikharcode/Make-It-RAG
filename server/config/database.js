const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool using the DATABASE_URL environment variable
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
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