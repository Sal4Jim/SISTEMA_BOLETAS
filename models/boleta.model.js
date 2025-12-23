const { pool } = require('../config/database');

const Boleta = {
    create: async (boletaData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { total_venta, productos } = boletaData;

            // 1. Obtener el siguiente correlativo para la serie B001
            const [serieResult] = await connection.query("SELECT IFNULL(MAX(correlativo), 0) + 1 as siguiente FROM boleta WHERE serie = 'B001'");
            const nuevoCorrelativo = serieResult[0].siguiente;

            // 2. Insertar en la tabla `boleta`
            const [boletaResult] = await connection.query(
                'INSERT INTO boleta (serie, correlativo, total_venta, id_cliente) VALUES (?, ?, ?, ?)',
                ['B001', nuevoCorrelativo, total_venta, 1] // id_cliente 1 por defecto (CLIENTE VARIOS)
            );
            const idBoleta = boletaResult.insertId;

            // 3. Insertar cada producto en `detalle_boleta`
            for (const producto of productos) {
                await connection.query(
                    'INSERT INTO detalle_boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [idBoleta, producto.id_producto, producto.cantidad, producto.precio]
                );
            }

            await connection.commit();
            
            // Retornamos los datos completos para que el controlador pueda imprimir
            return { id_boleta: idBoleta, serie: 'B001', correlativo: nuevoCorrelativo, ...boletaData };

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