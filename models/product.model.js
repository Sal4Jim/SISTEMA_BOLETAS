const { pool } = require('../config/database');

const Product = {
    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM producto');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
        return rows[0];
    },

    create: async (productData) => {
        const { nombre, stock, precio, id_categoria } = productData;
        const [result] = await pool.query(
            'INSERT INTO producto (nombre, stock, precio, id_categoria) VALUES (?, ?, ?, ?)',
            [nombre, stock || 0, precio, id_categoria]
        );
        return { id: result.insertId, ...productData };
    },

    update: async (id, productData) => {
        const { nombre, stock, precio, id_categoria } = productData;
        const [result] = await pool.query(
            'UPDATE producto SET nombre = ?, stock = ?, precio = ?, id_categoria = ? WHERE id_producto = ?',
            [nombre, stock, precio, id_categoria, id]
        );
        return result.affectedRows;
    }
};

module.exports = Product;