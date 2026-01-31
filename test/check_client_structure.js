const { pool } = require('../config/database');

async function checkClientTable() {
    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM cliente');
        console.log('Columnas:', columns.map(c => c.Field));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkClientTable();
