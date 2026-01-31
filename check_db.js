const { pool } = require('./config/database');
async function checkColumns() {
    try {
        const [rows] = await pool.query('DESCRIBE producto');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkColumns();
