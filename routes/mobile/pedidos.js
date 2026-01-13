const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

// POST /api/mobile/pedidos - Crear pedido desde app móvil
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { mesa, notas, total_estimado, productos } = req.body;

        console.log('Datos recibidos:', { mesa, notas, total_estimado, productos });

        // Validaciones
        if (!mesa || total_estimado === undefined || !productos || !Array.isArray(productos)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Se requiere: mesa, total_estimado, productos'
            });
        }

        if (productos.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'La lista de productos no puede estar vacía'
            });
        }

        // 1. Insertar ticket
        const [ticketResult] = await connection.execute(
            'INSERT INTO ticket (mesa, total_estimado, notas) VALUES (?, ?, ?)',
            [mesa, parseFloat(total_estimado), notas || '']
        );

        const id_ticket = ticketResult.insertId;
        console.log('Ticket creado ID:', id_ticket);

        // 2. Insertar detalles del ticket
        for (const producto of productos) {
            if (producto.cantidad > 0) {
                await connection.execute(
                    'INSERT INTO detalle_ticket (id_ticket, id_producto, cantidad) VALUES (?, ?, ?)',
                    [id_ticket, producto.id_producto, producto.cantidad]
                );
                console.log(`Producto ${producto.id_producto} x${producto.cantidad} agregado`);
            }
        }

        // 3. Si no es delivery, crear boleta automáticamente
        if (mesa !== 'delivery') {
            // Obtener siguiente correlativo
            const [corrResult] = await connection.execute(
                "SELECT MAX(correlativo) as max_correlativo FROM boleta WHERE serie = 'B001'"
            );

            let correlativo = 1000;
            if (corrResult[0] && corrResult[0].max_correlativo) {
                correlativo = corrResult[0].max_correlativo + 1;
            }

            console.log('Correlativo para boleta:', correlativo);

            // Insertar boleta
            const [boletaResult] = await connection.execute(
                `INSERT INTO boleta 
                 (serie, correlativo, total_venta, id_pago, id_cliente, id_ticket) 
                 VALUES ('B001', ?, ?, 1, 1, ?)`,
                [correlativo, parseFloat(total_estimado), id_ticket]
            );

            const id_boleta = boletaResult.insertId;
            console.log('Boleta creada ID:', id_boleta);

            // Insertar detalles de boleta
            await connection.execute(
                `INSERT INTO detalle_boleta (id_boleta, id_producto, cantidad, precio_unitario)
                 SELECT ?, dt.id_producto, dt.cantidad, p.precio 
                 FROM detalle_ticket dt 
                 JOIN producto p ON dt.id_producto = p.id_producto 
                 WHERE dt.id_ticket = ?`,
                [id_boleta, id_ticket]
            );

            console.log('Detalles de boleta insertados');
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Pedido registrado correctamente',
            id_pedido: id_ticket
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar pedido móvil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar pedido: ' + error.message,
            sqlError: error.sqlMessage,
            code: error.code
        });
    } finally {
        connection.release();
    }
});

module.exports = router;