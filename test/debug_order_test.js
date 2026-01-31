const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'boletera_bd',
    charset: 'utf8mb4'
};

async function testOrder() {
    console.log('Iniciando prueba de pedido...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        console.log('Conexión establecida y transacción iniciada');

        const mesa = "1";
        const total_estimado = 12.00;
        const notas = "Prueba debug";
        const productos = [
            { id_producto: 1, cantidad: 1 }, // Asumiendo ID 1 existe (Menu)
            { id_producto: 4, cantidad: 1 }  // Asumiendo ID 4 existe (Entrada)
        ];

        // 1. Insertar ticket
        console.log('Intentando insertar ticket...');
        const [ticketResult] = await connection.execute(
            'INSERT INTO ticket (mesa, total_estimado, notas) VALUES (?, ?, ?)',
            [mesa, parseFloat(total_estimado), notas]
        );
        const id_ticket = ticketResult.insertId;
        console.log('Ticket creado ID:', id_ticket);

        // 2. Insertar detalles
        console.log('Intentando insertar detalles...');
        for (const producto of productos) {
            await connection.execute(
                'INSERT INTO detalle_ticket (id_ticket, id_producto, cantidad) VALUES (?, ?, ?)',
                [id_ticket, producto.id_producto, producto.cantidad]
            );
        }
        console.log('Detalles insertados');

        // 3. Insertar boleta (Lógica crítica)
        console.log('Intentando proceso de boleta...');

        // Obtener correlativo
        const [corrResult] = await connection.execute(
            "SELECT MAX(correlativo) as max_correlativo FROM boleta WHERE serie = 'B001'"
        );
        let correlativo = 1000;
        if (corrResult[0] && corrResult[0].max_correlativo) {
            correlativo = corrResult[0].max_correlativo + 1;
        }
        console.log('Correlativo calculado:', correlativo);

        // Insertar boleta
        console.log('Intentando INSERT INTO boleta...');
        const [boletaResult] = await connection.execute(
            `INSERT INTO boleta 
             (serie, correlativo, total_venta, metodo_pago, id_cliente, id_ticket) 
             VALUES ('B001', ?, ?, 'EFECTIVO', 1, ?)`,
            [correlativo, parseFloat(total_estimado), id_ticket]
        ); // AQUÍ PUEDE FALLAR SI CLIENTE 1 NO EXISTE

        const id_boleta = boletaResult.insertId;
        console.log('Boleta creada ID:', id_boleta);

        // Insertar detalle boleta
        console.log('Intentando INSERT INTO detalle_boleta...');
        await connection.execute(
            `INSERT INTO detalle_boleta (id_boleta, id_producto, cantidad, precio_unitario)
             SELECT ?, dt.id_producto, dt.cantidad, p.precio 
             FROM detalle_ticket dt 
             JOIN producto p ON dt.id_producto = p.id_producto 
             WHERE dt.id_ticket = ?`,
            [id_boleta, id_ticket]
        );

        await connection.commit();
        console.log('¡PRUEBA EXITOSA! Todo funcionó correctamente.');

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('\n!!! ERROR ENCONTRADO !!!');
        console.error('Mensaje:', error.message);
        console.error('Código SQL:', error.code);
        console.error('SQL State:', error.sqlState);
    } finally {
        if (connection) await connection.end();
    }
}

testOrder();
