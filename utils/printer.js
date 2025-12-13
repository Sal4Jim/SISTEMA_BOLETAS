const escpos = require('escpos');
const Network = require('escpos-network');

// Función para imprimir el ticket
const imprimirTicket = (venta) => {
    return new Promise((resolve, reject) => {
        try {
            // Datos de la empresa (Simulación para SUNAT)
            const empresa = {
                ruc: '20999999991',
                razonSocial: 'PK2 - RESTAURANT Y CEBICHERIA',
                direccion: 'Av. Independencia 685, Moche 13600'
            };

            // Cálculos de impuestos (Asumiendo precios incluyen IGV)
            const total = Number(venta.total) || 0;
            const baseImponible = total / 1.18;
            const igv = total - baseImponible;

            // Formato de serie y número (Simulado usando el ID de la BD)
            const serie = 'B001';
            const numero = String(venta.id || 0).padStart(8, '0');

            // --- PREVISUALIZACIÓN EN CONSOLA (LEGIBLE) ---
            console.log('\n\n--- [SIMULACIÓN BOLETA SUNAT] ---');
            console.log(empresa.razonSocial);
            console.log(`RUC: ${empresa.ruc}`);
            console.log('BOLETA DE VENTA ELECTRONICA');
            console.log(`${serie}-${numero}`);
            console.log('----------------------------------------');
            console.log(`TOTAL: S/ ${total.toFixed(2)}`);
            console.log('----------------------------------------\n');


            // --- IMPRESIÓN REAL (RED / WIFI) ---
            const PRINTER_IP = '192.168.100.64'; 
            const PRINTER_PORT = 9100; 

            const device = new Network(PRINTER_IP, PRINTER_PORT);
            const options = { encoding: "cp850" };
            const printer = new escpos.Printer(device, options);

            device.open(function (error) {
                if (error) {
                    console.error("Error al abrir el dispositivo de impresión:", error);
                    return reject(error);
                }

                // --- CORRECCIÓN DE MODO CHINO ---
                device.write(Buffer.from([0x1C, 0x2E, 0x1B, 0x74, 0x02]));

                // Encabezado
                printer
                    .encode('cp850')  // Asegura la codificación para tildes y ñ 
                    .align('ct')
                    .style('normal')   // Resetear estilos (quita negrita)
                    .font('b')         // Fuente B (más pequeña)
                    .size(1, 1)        // Tamaño normal
                    .text(empresa.razonSocial)
                    .text(empresa.direccion)
                    .text(`RUC: ${empresa.ruc}`)
                    .text('--------------------------------')
                    .text('BOLETA DE VENTA ELECTRONICA')
                    .text(`${serie}-${numero}`)
                    .text('--------------------------------');

                // Información de la venta
                printer
                    .align('lt')
                    .text(`Fecha Emision: ${new Date(venta.fecha).toLocaleString('es-PE')}`)
                    .text(`Cliente: CLIENTE VARIOS`) // Placeholder hasta tener clientes
                    .text(`DNI/RUC: 00000000`)       // Placeholder
                    .text(`Moneda: SOLES`)
                    .text('--------------------------------')
                    .text('CANT   DESCRIPCION       P.UNIT   TOTAL');

                // Detalles de productos
                if (venta.productos && venta.productos.length > 0) {
                    venta.productos.forEach(prod => {
                        const nombreProducto = prod.nombre || `Producto #${prod.id}`;
                        const precio = Number(prod.precio).toFixed(2);
                        const subtotal = Number(prod.subtotal).toFixed(2);

                        // Imprimimos nombre primero (alineado a la izquierda)
                        printer.align('lt').text(nombreProducto);
                        // Luego cantidad, precio y total (alineado a la derecha)
                        printer.align('rt').text(`${prod.cantidad} x ${precio}      ${subtotal}`);
                    });
                }

                // Totales
                printer
                    .align('lt')
                    .text('--------------------------------')
                    .align('rt')
                    .text(`Op. Gravada: S/ ${baseImponible.toFixed(2)}`)
                    .text(`I.G.V. (18%): S/ ${igv.toFixed(2)}`)
                    .text('--------------------------------')
                    .text(`IMPORTE TOTAL: S/ ${total.toFixed(2)}`)
                    .text('--------------------------------')
                    .align('ct')
                    .text('Representacion Impresa de la')
                    .text('Boleta de Venta Electronica')
                    .text('.')
                    .cut()
                    .close();

                resolve(true);
            });
        } catch (err) {
            console.error("Error en la función imprimirTicket:", err);
            reject(err);
        }
    });
};

module.exports = { imprimirTicket };