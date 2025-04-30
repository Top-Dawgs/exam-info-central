const mysql = require('mysql2');

// create a connection pool for better performance and stability

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2025',
    database: 'ExamManagementSystem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();