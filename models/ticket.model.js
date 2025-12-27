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
    }
};

module.exports = Ticket;