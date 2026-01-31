const { pool } = require('../config/database');

async function checkDocs() {
    try {
        const [rows] = await pool.query('SELECT * FROM documento_identidad');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkDocs();
