const { pool } = require('../config/database');

const Ticket = {
    create: async (ticketData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { mesa, notas, productos, total_estimado } = ticketData;

            // 1. Insertar en la tabla `ticket` (Cabecera)
            const [ticketResult] = await connection.query(
                'INSERT INTO ticket (mesa, notas, total_estimado) VALUES (?, ?, ?)',
                [mesa, notas || '', total_estimado || 0]
            );
            const idTicket = ticketResult.insertId;

            // 2. Insertar cada producto en `detalle_ticket`
            for (const producto of productos) {
                await connection.query(
                    'INSERT INTO detalle_ticket (id_ticket, id_producto, cantidad) VALUES (?, ?, ?)',
                    [idTicket, producto.id_producto, producto.cantidad]
                );
            }

            await connection.commit();
            
            // Retornamos el objeto completo con el ID generado
            return { id_ticket: idTicket, fecha_emision: new Date(), ...ticketData };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    findByDate: async (fecha) => {
        // fecha viene en formato YYYY-MM-DD
        const [rows] = await pool.query(
            'SELECT * FROM ticket WHERE DATE(fecha_emision) = ? ORDER BY fecha_emision DESC',
            [fecha]
        );
        return rows;
    },

    getDailyStats: async (fecha) => {
        const connection = await pool.getConnection();
        try {
            // 1. Agrupación de productos vendidos (Cantidad por Plato)
            const [productos] = await connection.query(`
                SELECT p.nombre, SUM(dt.cantidad) as cantidad
                FROM ticket t
                JOIN detalle_ticket dt ON t.id_ticket = dt.id_ticket
                JOIN producto p ON dt.id_producto = p.id_producto
                WHERE DATE(t.fecha_emision) = ?
                GROUP BY p.id_producto, p.nombre
                ORDER BY cantidad DESC
            `, [fecha]);

            // 2. Total monetario del día (Suma de totales estimados)
            const [totalResult] = await connection.query(`
                SELECT SUM(total_estimado) as total
                FROM ticket
                WHERE DATE(fecha_emision) = ?
            `, [fecha]);

            return {
                productos,
                total: totalResult[0].total || 0
            };
        } finally {
            connection.release();
        }
    }
};

module.exports = Ticket;