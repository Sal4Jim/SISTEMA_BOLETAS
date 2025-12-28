const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'boletera_bd',
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