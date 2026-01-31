const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'boletera_bd',
    charset: 'utf8mb4'
};

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('DESCRIBE boleta');
        console.log('Estructura de tabla BOLETA:');
        console.table(rows);
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
