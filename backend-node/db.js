const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "phantix_user",
  password: "phantix_pass",
  database: "phantix_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
