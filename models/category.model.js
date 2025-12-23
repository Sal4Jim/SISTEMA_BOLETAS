const { pool } = require('../config/database');

const Category = {
    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM categoria ORDER BY nombre ASC');
        return rows;
    },
};

module.exports = Category;