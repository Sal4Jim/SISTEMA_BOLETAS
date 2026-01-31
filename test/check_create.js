const { pool } = require('../config/database');

async function showCreateClient() {
    try {
        const [rows] = await pool.query('SHOW CREATE TABLE cliente');
        console.log(rows[0]['Create Table']);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

showCreateClient();
