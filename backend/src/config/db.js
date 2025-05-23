const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Acceder al .env en la raíz del proyecto o ajustar

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 // Aumentado por si acaso
});

pool.getConnection()
    .then(connection => {
        console.log('MySQL Pool Connected successfully.');
        connection.release();
    })
    .catch(err => {
        console.error('🔴 Error connecting to MySQL Pool:', err.code, err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('➡️ Check your DB_USER and DB_PASSWORD in .env file.');
        } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            console.error('➡️ Check your DB_HOST in .env file and ensure MySQL server is running.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`➡️ Database '${process.env.DB_NAME}' does not exist. Please create it or check DB_NAME in .env.`);
        }
    });

module.exports = pool;