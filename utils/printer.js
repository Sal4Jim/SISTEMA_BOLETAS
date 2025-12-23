const escpos = require('escpos');
const Network = require('escpos-network');
const path = require('path');
const fs = require('fs');

// Función para imprimir el ticket
const imprimirTicket = (venta) => {
    return new Promise((resolve, reject) => {
        try {
            // Datos de la empresa (Simulación para SUNAT)
            const empresa = {
                ruc: '20999999991',
                razonSocial: 'PK2 - RESTAURANT',
                direccion: 'Av. Independencia 685, Moche 13600'
            };

            // Cálculos de impuestos (Asumiendo precios incluyen IGV)
            const total = Number(venta.total_venta) || 0;
            const baseImponible = total / 1.18;
            const igv = total - baseImponible;

            // Formato de serie y número (Simulado usando el ID de la BD)
            const serie = venta.serie || 'B001';
            const numero = String(venta.correlativo || 0).padStart(8, '0');

            // --- PREVISUALIZACIÓN EN CONSOLA (LEGIBLE) ---
            console.log('\n\n--- [SIMULACIÓN BOLETA SUNAT] ---');
            console.log(empresa.razonSocial);
            console.log(`RUC: ${empresa.ruc}`);
            console.log('BOLETA DE VENTA ELECTRONICA');
            console.log(`${serie}-${numero}`);
            console.log('------------------------------------------------');
            console.log(`TOTAL: S/ ${total.toFixed(2)}`);
            console.log('------------------------------------------------\n');


            // --- IMPRESIÓN REAL (RED / WIFI) ---
            const PRINTER_IP = '192.168.100.64'; 
            const PRINTER_PORT = 9100; 

            const device = new Network(PRINTER_IP, PRINTER_PORT);
            const options = { encoding: "cp850" };
            const printer = new escpos.Printer(device, options);

            // Función auxiliar para imprimir el contenido de texto (para reutilizarla)
            const imprimirContenido = () => {
                // Encabezado
                printer
                    .encode('cp850')  // Asegura la codificación para tildes y ñ 
                    .align('ct')
                    .text(empresa.razonSocial)
                    .text(empresa.direccion)
                    .text(`RUC: ${empresa.ruc}`)
                    .text('------------------------------------------------')
                    .text('BOLETA DE VENTA ELECTRONICA')
                    .text(`${serie}-${numero}`)
                    .text('------------------------------------------------');

                // Información de la venta
                printer
                    .align('lt')
                    .text(`Fecha Emision: ${new Date(venta.fecha_emision).toLocaleString('es-PE')}`)
                    .text(`Cliente: CLIENTE VARIOS`) // Placeholder hasta tener clientes
                    .text(`DNI/RUC: 00000000`)       // Placeholder
                    .text(`Moneda: SOLES`)
                    .text('------------------------------------------------')
                    .text('CAN  PRODUCTO                 P.UNIT     TOTAL')
                    .text('------------------------------------------------');

                // Detalles de productos
                if (venta.productos && venta.productos.length > 0) {
                    venta.productos.forEach(prod => {
                        const nombreProducto = prod.nombre || `Producto #${prod.id_producto}`;
                        const precio = Number(prod.precio_unitario).toFixed(2);
                        const subtotal = Number(prod.subtotal).toFixed(2);
                        const cantidad = String(prod.cantidad);

                        // Ancho 80mm (~48 caracteres)
                        // CAN(4) PROD(22) PREC(9) TOT(10) + 3 espacios = 48
                        const colCant = cantidad.padEnd(4).substring(0, 4);
                        const colProd = nombreProducto.padEnd(22).substring(0, 22);
                        const colPrec = precio.padStart(9).substring(0, 9);
                        const colTotal = subtotal.padStart(10).substring(0, 10);

                        printer.text(`${colCant} ${colProd} ${colPrec} ${colTotal}`);
                    });
                }

                // Totales
                printer
                    .align('lt')
                    .text('------------------------------------------------')
                    .align('rt')
                    .text(`Op. Gravada: S/ ${baseImponible.toFixed(2)}`)
                    .text(`I.G.V. (18%): S/ ${igv.toFixed(2)}`)
                    .text('------------------------------------------------')
                    .text(`IMPORTE TOTAL: S/ ${total.toFixed(2)}`)
                    .text('------------------------------------------------')
                    .align('ct')
                    .text('Representacion Impresa de la')
                    .text('Boleta de Venta Electronica')
                    .text('.')
                    .cut()
                    .close();
            };

            device.open(function (error) {
                if (error) {
                    console.error("Error al abrir el dispositivo de impresión:", error);
                    return reject(error);
                }

                // --- CORRECCIÓN DE MODO CHINO Y RESET TOTAL ---
                // 0x1B 0x40: Inicializar impresora (ESC @) -> Borra negritas, tamaños gigantes y configuraciones previas
                // 0x1C 0x2E: Cancelar modo Kanji/Chino (FS .)
                // 0x1B 0x74 0x02: Forzar tabla de caracteres PC850 (ESC t 2)
                // 0x1B 0x21 0x00: Modo de impresión: Fuente A (Normal), Sin negrita (ESC ! 0)
                // 0x1D 0x21 0x00: GS ! 0 -> Tamaño Normal (redundancia de seguridad)
                device.write(Buffer.from([0x1B, 0x40, 0x1C, 0x2E, 0x1B, 0x74, 0x02, 0x1B, 0x21, 0x00, 0x1D, 0x21, 0x00]));

                // Intentar cargar e imprimir logo
                const logoPath = path.join(__dirname, '../public/images/logo2.png');
                
                if (fs.existsSync(logoPath)) {
                    escpos.Image.load(logoPath, function(image) {
                        printer.align('ct')
                               .image(image, 's8') // Imprimir imagen
                               .then(() => {
                                   imprimirContenido();
                                   resolve(true);
                               });
                    });
                } else {
                    imprimirContenido();
                    resolve(true);
                }
            });
        } catch (err) {
            console.error("Error en la función imprimirTicket:", err);
            reject(err);
        }
    });
};

module.exports = { imprimirTicket };