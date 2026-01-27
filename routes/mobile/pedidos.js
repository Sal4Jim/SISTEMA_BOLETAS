const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { imprimirTicketComanda, imprimirTicket } = require('../../utils/printer'); // Importar impresora

// POST /api/mobile/pedidos - Crear pedido desde app móvil
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { mesa, notas, total_estimado, productos } = req.body;

        // Validaciones básicas
        if (!mesa || total_estimado === undefined || !productos || !Array.isArray(productos)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Se requiere: mesa, total_estimado, productos (array)'
            });
        }

        // Validación y parseo de total_estimado (soporte para comas y puntos)
        let total = total_estimado;
        if (typeof total_estimado === 'string') {
            total = parseFloat(total_estimado.replace(',', '.'));
        } else {
            total = parseFloat(total_estimado);
        }

        if (isNaN(total)) {
             await connection.rollback();
             return res.status(400).json({
                success: false,
                message: 'Total estimado inválido: ' + total_estimado
            });
        }

        if (productos.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'La lista de productos no puede estar vacía'
            });
        }

        // Validación estricta de cada producto
        for (const p of productos) {
            if (!p.id_producto || !p.cantidad) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Producto inválido detectado (falta id o cantidad): ' + JSON.stringify(p)
                });
            }
        }

        // --- OBTENER DATOS COMPLETOS DE PRODUCTOS PARA IMPRESIÓN ---
        // La app móvil solo envía ID y Cantidad. Necesitamos Nombre y Precio para el ticket.
        let productosEnriquecidos = [];
        try {
            const ids = productos.map(p => p.id_producto);
            if (ids.length > 0) {
                // Usamos query en lugar de execute para soportar IN (?) con array
                const [rows] = await connection.query(
                    'SELECT id_producto, nombre, precio FROM producto WHERE id_producto IN (?)',
                    [ids]
                );
                
                productosEnriquecidos = productos.map(p => {
                    const info = rows.find(r => r.id_producto == p.id_producto);
                    return {
                        ...p,
                        nombre: info ? info.nombre : `Producto ${p.id_producto}`,
                        precio_unitario: info ? info.precio : 0,
                        subtotal: info ? (info.precio * p.cantidad) : 0
                    };
                });
            }
        } catch (err) {
            console.error('Error obteniendo detalles productos:', err);
            productosEnriquecidos = productos.map(p => ({...p, nombre: `ID: ${p.id_producto}`}));
        }
        // -----------------------------------------------------------

        // 1. Insertar ticket
        const [ticketResult] = await connection.execute(
            'INSERT INTO ticket (mesa, total_estimado, notas) VALUES (?, ?, ?)',
            [mesa, total, notas || '']
        );

        const id_ticket = ticketResult.insertId;

        // 2. Insertar detalles del ticket
        for (const producto of productos) {
            if (producto.cantidad > 0) {
                await connection.execute(
                    'INSERT INTO detalle_ticket (id_ticket, id_producto, cantidad) VALUES (?, ?, ?)',
                    [id_ticket, producto.id_producto, producto.cantidad]
                );
            }
        }

        // 3. Si no es delivery, crear boleta automáticamente
        let boletaParaImprimir = null;

        if (mesa !== 'delivery') {
            // Obtener siguiente correlativo
            const [corrResult] = await connection.execute(
                "SELECT MAX(correlativo) as max_correlativo FROM boleta WHERE serie = 'B001'"
            );

            let correlativo = 1000;
            if (corrResult[0] && corrResult[0].max_correlativo) {
                correlativo = corrResult[0].max_correlativo + 1;
            }

            // Insertar boleta
            // NOTA: Se usa id_pago = 1 (Efectivo) por defecto y id_cliente = 1 (Genérico) ya que la app móvil no los envía aún
            const [boletaResult] = await connection.execute(
                `INSERT INTO boleta 
                 (serie, correlativo, total_venta, id_pago, id_cliente, id_ticket) 
                 VALUES ('B001', ?, ?, 1, 1, ?)`,
                [correlativo, total, id_ticket]
            );

            const id_boleta = boletaResult.insertId;

            // Insertar detalles de boleta copiando del ticket
            await connection.execute(
                `INSERT INTO detalle_boleta (id_boleta, id_producto, cantidad, precio_unitario)
                 SELECT ?, dt.id_producto, dt.cantidad, p.precio 
                 FROM detalle_ticket dt 
                 JOIN producto p ON dt.id_producto = p.id_producto 
                 WHERE dt.id_ticket = ?`,
                [id_boleta, id_ticket]
            );

            // Preparar datos para imprimir boleta
            boletaParaImprimir = {
                id_boleta,
                serie: 'B001',
                correlativo,
                total_venta: total,
                fecha_emision: new Date(),
                productos: productosEnriquecidos
            };
        }

        await connection.commit();

        // 1. Responder INMEDIATAMENTE a la App Móvil (para que no se quede cargando)
        res.json({
            success: true,
            message: 'Pedido registrado correctamente',
            id_pedido: id_ticket
        });

        // 2. IMPRESIÓN EN SEGUNDO PLANO (Secuencial para evitar bloqueo de puerto)
        (async () => {
            try {
                // A. Imprimir Comanda
                const ticketComanda = {
                    id_ticket, mesa, fecha_emision: new Date(),
                    productos: productosEnriquecidos, notas, total_estimado: total
                };
                await imprimirTicketComanda(ticketComanda);

                // B. Imprimir Boleta (si existe)
                if (boletaParaImprimir) {
                    // Esperar 2 segundos para que la impresora libere el buffer
                    await new Promise(r => setTimeout(r, 10000));
                    await imprimirTicket(boletaParaImprimir);
                }
            } catch (err) {
                console.error('⚠️ Error en impresión automática:', err.message);
            }
        })();

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al registrar pedido móvil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar pedido: ' + error.message,
            sqlError: error.sqlMessage,
            code: error.code
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
