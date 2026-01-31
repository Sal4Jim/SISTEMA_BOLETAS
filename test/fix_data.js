const { pool } = require('../config/database');

async function fixData() {
    try {
        // 1. Check columns of documento_identidad
        const [cols] = await pool.query('SHOW COLUMNS FROM documento_identidad');
        console.log('Columnas doc:', cols.map(c => c.Field));

        // 2. Insert default document types if empty
        const [docs] = await pool.query('SELECT * FROM documento_identidad');
        if (docs.length === 0) {
            console.log('Insertando documentos de identidad...');
            // Assuming table has id_documento and nombre/descripcion
            // If auto_increment, I will let it be, but standard is often fixed ids for these.
            // Let's guess 'nombre' or 'descripcion'.
            const colNames = cols.map(c => c.Field);
            const nameCol = colNames.find(c => c.includes('nom') || c.includes('desc'));

            if (nameCol) {
                await pool.query(`INSERT INTO documento_identidad (id_documento, ${nameCol}) VALUES (1, 'DNI'), (6, 'RUC')`);
                console.log('Documentos insertados.');
            }
        }

        // 3. Insert default client
        const [clients] = await pool.query('SELECT * FROM cliente WHERE id_cliente = 1');
        if (clients.length === 0) {
            console.log('Creando cliente por defecto...');
            // Using column names found earlier: id_cliente, id_documento, numero_documento, raz_social, direccion, email
            await pool.query("INSERT INTO cliente (id_cliente, id_documento, numero_documento, razon_social, direccion) VALUES (1, 1, '00000000', 'CLIENTE VARIOS', 'SIN DIRECCION')");
            console.log('Cliente creado.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

fixData();
