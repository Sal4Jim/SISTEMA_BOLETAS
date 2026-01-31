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

            // Obtener precios actuales de la BD para asegurar el valor fijo inicial
            const ids = productos.map(p => p.id_producto);
            let preciosBD = [];
            if (ids.length > 0) {
                const [rows] = await connection.query('SELECT id_producto, precio FROM producto WHERE id_producto IN (?)', [ids]);
                preciosBD = rows;
            }

            // 2. Insertar cada producto en `detalle_ticket`
            for (const producto of productos) {
                const info = preciosBD.find(p => p.id_producto == producto.id_producto);
                const precioFinal = producto.precio_unitario !== undefined ? producto.precio_unitario : (info ? info.precio : 0);

                await connection.query(
                    'INSERT INTO detalle_ticket (id_ticket, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [idTicket, producto.id_producto, producto.cantidad, precioFinal]
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

    update: async (idTicket, ticketData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { mesa, notas, productos, total_estimado } = ticketData;

            // 1. Actualizar cabecera
            await connection.query(
                'UPDATE ticket SET mesa = ?, notas = ?, total_estimado = ? WHERE id_ticket = ?',
                [mesa, notas || '', total_estimado || 0, idTicket]
            );

            // 2. Actualizar detalles: Estrategia simple -> Borrar y reinsertar
            await connection.query('DELETE FROM detalle_ticket WHERE id_ticket = ?', [idTicket]);

            if (productos && productos.length > 0) {
                for (const producto of productos) {
                    await connection.query(
                        'INSERT INTO detalle_ticket (id_ticket, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                        [idTicket, producto.id_producto, producto.cantidad, producto.precio_unitario || 0]
                    );
                }
            }

            await connection.commit();
            return { id_ticket: idTicket, ...ticketData };
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
    },

    getByIdWithDetails: async (idTicket) => {
        const connection = await pool.getConnection();
        try {
            // 1. Obtener cabecera
            const [ticketRows] = await connection.query('SELECT * FROM ticket WHERE id_ticket = ?', [idTicket]);
            if (ticketRows.length === 0) return null;
            const ticket = ticketRows[0];

            // 2. Obtener detalles (productos)
            const [detalles] = await connection.query(`
                SELECT dt.cantidad, p.nombre, COALESCE(dt.precio_unitario, p.precio) as precio_real, p.id_producto, p.id_categoria
                FROM detalle_ticket dt
                JOIN producto p ON dt.id_producto = p.id_producto
                WHERE dt.id_ticket = ?
            `, [idTicket]);

            // 3. Formatear productos para que coincidan con lo que espera el printer
            // El printer espera: nombre, precio_unitario, subtotal, cantidad
            const productos = detalles.map(d => ({
                id_producto: d.id_producto,
                nombre: d.nombre,
                cantidad: d.cantidad,
                precio_unitario: d.precio_real,
                subtotal: d.cantidad * d.precio_real,
                id_categoria: d.id_categoria
            }));

            // Si el ticket no tiene total_venta (porque es un ticket de comanda convertido),
            // lo calculamos o usamos el total_estimado
            const totalCalculado = productos.reduce((acc, curr) => acc + curr.subtotal, 0);

            return {
                ...ticket,
                total_venta: ticket.total_estimado || totalCalculado, // Usamos total_estimado si existe
                productos
            };
        } finally {
            connection.release();
        }
    }
};

module.exports = Ticket;