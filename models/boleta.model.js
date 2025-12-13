const { pool } = require('../config/database');

const Boleta = {
    create: async (boletaData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { total, productos } = boletaData;

            // 1. Insertar en la tabla `boleta`
            const [boletaResult] = await connection.query(
                'INSERT INTO boleta (total) VALUES (?)',
                [total]
            );
            const boletaId = boletaResult.insertId;

            // 2. Insertar cada producto en `boleta_detalle`
            for (const producto of productos) {
                await connection.query(
                    'INSERT INTO boleta_detalle (boleta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [boletaId, producto.producto_id, producto.cantidad, producto.precio]
                );
            }

            await connection.commit();
            return { id: boletaId, ...boletaData };

        } catch (error) {
            await connection.rollback();
            console.error("Error al crear la boleta en la BD:", error);
            throw error; // Propagar el error para que el controlador lo maneje
        } finally {
            connection.release();
        }
    }
};

module.exports = Boleta;