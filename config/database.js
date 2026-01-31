const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        return { success: true, message: 'Conexión a la base de datos exitosa.' };
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        return { success: false, message: 'No se pudo conectar a la base de datos.', error: error.message };
    }
};

module.exports = {
    pool,
    testConnection
};