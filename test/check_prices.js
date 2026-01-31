const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'boletera_bd',
    charset: 'utf8mb4'
};

async function checkPrices() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id_producto, nombre, precio FROM producto WHERE id_producto IN (1, 4)');
        console.log('Precios de productos:');
        console.table(rows);
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkPrices();
