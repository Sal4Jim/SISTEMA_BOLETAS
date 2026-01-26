const { pool } = require('../config/database');

async function checkDocumentTable() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tablas:', tables);

        // Try to check document table if exists
        const docTable = tables.find(t => Object.values(t)[0].includes('documento'));
        if (docTable) {
            const tableName = Object.values(docTable)[0];
            const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
            console.log(`Contenido de ${tableName}:`, rows);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkDocumentTable();
