const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  port: Number(DB_PORT || 3306),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME || 'portfolio_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Add query method as alias to execute for backward compatibility
// execute returns [rows, fields], query should return just rows
pool.query = async function(sql, values) {
  const [rows] = await this.execute(sql, values);
  return rows;
};

module.exports = pool;

