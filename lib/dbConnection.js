const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost', // Your MySQL server host
  user: 'root',      // Your MySQL username
  password: '',      // Your MySQL password
  database: 'fast_food', // Your database name
  connectionLimit: 10        // Optional: Limit the number of simultaneous connections
});

// Export the pool for use in other files
module.exports = pool;
