const { pool } = require('../config/database');

const Usuario = {
    // Buscar usuario por nombre de usuario
    findByUsername: async (username) => {
        try {
            const [rows] = await pool.query('SELECT * FROM usuario WHERE username = ?', [username]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear un nuevo usuario (útil para el seeding)
    create: async (username, password, rol = 'admin') => {
        try {
            const [result] = await pool.query(
                'INSERT INTO usuario (username, password, rol) VALUES (?, ?, ?)',
                [username, password, rol]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Verificar si existe algún usuario (para el seeding)
    count: async () => {
        try {
            const [rows] = await pool.query('SELECT COUNT(*) as count FROM usuario');
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Usuario;
