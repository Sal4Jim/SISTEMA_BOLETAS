const { pool } = require('../config/database');

async function checkClients() {
    try {
        const [rows] = await pool.query('SELECT * FROM cliente');
        console.log('Clientes existentes:', rows);

        if (rows.length === 0) {
            console.log('No hay clientes. Intentando crear cliente por defecto...');
            await pool.query("INSERT INTO cliente (id_cliente, nombre, dni_ruc, direccion) VALUES (1, 'CLIENTE VARIOS', '00000000', 'SIN DIRECCION')");
            console.log('Cliente por defecto creado.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkClients();
