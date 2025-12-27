const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

// GET /api/mobile/productos - Obtener productos para app móvil
router.get('/', async (req, res) => {
    try {
        const { activo, categoria, categorias } = req.query;

        let sql = `
            SELECT 
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen,
                p.activo,
                p.id_categoria,
                c.nombre as categoria_nombre
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE 1=1
        `;

        const params = [];

        if (activo !== undefined) {
            sql += ' AND p.activo = ?';
            params.push(parseInt(activo));
        }

        if (categoria !== undefined) {
            sql += ' AND p.id_categoria = ?';
            params.push(parseInt(categoria));
        }

        // Nuevo soporte para múltiples categorías (ej: ?categorias=1,4)
        if (categorias !== undefined) {
            const catIds = categorias.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (catIds.length > 0) {
                const placeholders = catIds.map(() => '?').join(',');
                sql += ` AND p.id_categoria IN (${placeholders})`;
                params.push(...catIds);
            }
        }

        sql += ' ORDER BY p.nombre';

        const [rows] = await pool.execute(sql, params);

        // Formatear respuesta para móvil
        const productos = rows.map(producto => ({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: parseFloat(producto.precio),
            imagen: producto.imagen,
            activo: Boolean(producto.activo),
            id_categoria: producto.id_categoria,
            categoria_nombre: producto.categoria_nombre
        }));

        res.json({
            success: true,
            message: 'Productos obtenidos correctamente',
            productos: productos
        });

    } catch (error) {
        console.error('Error al obtener productos para móvil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos',
            error: error.message
        });
    }
});

// PUT /api/mobile/productos/:id/activo - Activar/Desactivar producto
router.put('/:id/activo', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        if (activo === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el campo activo (boolean)'
            });
        }

        const [result] = await pool.execute(
            'UPDATE producto SET activo = ? WHERE id_producto = ?',
            [activo ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            message: `Producto ${activo ? 'activado' : 'desactivado'} correctamente`
        });

    } catch (error) {
        console.error('Error al actualizar estado del producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
});

module.exports = router;