const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

// GET /api/mobile/categorias - Obtener categorías para app móvil
router.get('/', async (req, res) => {
    try {
        const { activo } = req.query;

        let sql = 'SELECT * FROM categoria WHERE 1=1';
        const params = [];

        if (activo !== undefined) {
            sql += ' AND activo = ?';
            params.push(parseInt(activo));
        }

        sql += ' ORDER BY nombre';

        const [rows] = await pool.execute(sql, params);

        const categorias = rows.map(categoria => ({
            id_categoria: categoria.id_categoria,
            nombre: categoria.nombre,
            activo: Boolean(categoria.activo)
        }));

        res.json({
            success: true,
            message: 'Categorías obtenidas correctamente',
            categorias: categorias
        });

    } catch (error) {
        console.error('Error al obtener categorías para móvil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
});

module.exports = router;