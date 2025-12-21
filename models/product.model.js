const { pool } = require('../config/database');

const Product = {
    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM producto');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM producto WHERE producto_id = ?', [id]);
        return rows[0];
    },

    create: async (productData) => {
        const { nombre, cantidad, precio, categoria_id } = productData;
        const [result] = await pool.query(
            'INSERT INTO producto (nombre, cantidad, precio, categoria_id) VALUES (?, ?, ?, ?)',
            [nombre, cantidad, precio, categoria_id]
        );
        return { id: result.insertId, ...productData };
    },

    update: async (id, productData) => {
        const { nombre, cantidad, precio, categoria_id } = productData;
        const [result] = await pool.query(
            'UPDATE producto SET nombre = ?, cantidad = ?, precio = ?, categoria_id = ? WHERE producto_id = ?',
            [nombre, cantidad, precio, categoria_id, id]
        );
        return result.affectedRows;
    }
};

module.exports = Product;