const { pool } = require('./config/database');

async function fixPaymentMethods() {
    try {
        // 1. Check existing payment methods
        const [methods] = await pool.query('SELECT * FROM metodo_pago');
        console.log('Metodos de pago existentes:', methods);

        if (methods.length === 0) {
            console.log('No hay metodos de pago. Insertando defecto...');
            // Assuming table has id_pago and some name column
            const [cols] = await pool.query('SHOW COLUMNS FROM metodo_pago');
            const colNames = cols.map(c => c.Field);
            const nameCol = colNames.find(c => c.includes('nom') || c.includes('desc') || c.includes('metodo'));

            if (nameCol) {
                await pool.query(`INSERT INTO metodo_pago (id_pago, ${nameCol}) VALUES (1, 'EFECTIVO'), (2, 'YAPE'), (3, 'PLIN'), (4, 'TARJETA')`);
                console.log('Metodos de pago insertados.');
            } else {
                console.log('No se pudo identificar la columna de nombre para metodo_pago', colNames);
            }
        } else {
            // Check if ID 1 exists
            const exists = methods.find(m => m.id_pago === 1);
            if (!exists) {
                console.log('ID 1 no existe. Insertando...');
                const [cols] = await pool.query('SHOW COLUMNS FROM metodo_pago');
                const colNames = cols.map(c => c.Field);
                const nameCol = colNames.find(c => c.includes('nom') || c.includes('desc') || c.includes('metodo'));
                if (nameCol) {
                    await pool.query(`INSERT INTO metodo_pago (id_pago, ${nameCol}) VALUES (1, 'EFECTIVO')`);
                    console.log('Metodo EFECTIVO insertado.');
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

fixPaymentMethods();
