const { pool } = require('../config/database');

const Product = {
    findAll: async () => {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre AS nombre_categoria 
            FROM producto p 
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
        return rows[0];
    },

    create: async (productData) => {
        const { nombre, descripcion, precio, imagen, id_categoria, activo } = productData;
        const [result] = await pool.query(
            'INSERT INTO producto (nombre, descripcion, precio, imagen, id_categoria, activo) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion || null, precio, imagen || null, id_categoria, activo !== undefined ? activo : 1]
        );
        return { id: result.insertId, ...productData };
    },

    update: async (id, productData) => {
        const { nombre, descripcion, precio, imagen, id_categoria, activo } = productData;
        const [result] = await pool.query(
            'UPDATE producto SET nombre = ?, descripcion = ?, precio = ?, imagen = ?, id_categoria = ?, activo = ? WHERE id_producto = ?',
            [nombre, descripcion || null, precio, imagen || null, id_categoria, activo !== undefined ? activo : 1, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Product;