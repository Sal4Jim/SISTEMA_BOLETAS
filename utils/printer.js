const escpos = require('escpos');
const Network = require('escpos-network');
const path = require('path');
const fs = require('fs');

// CONFIGURACIÓN CENTRALIZADA DE IMPRESORA
const PRINTER_IP = '192.168.0.64'; // Cambia esto si la IP de la impresora cambia
const PRINTER_PORT = 9100;

// Helper para ordenar productos por categoría para impresión
const sortProductsByCategory = (products) => {
    if (!products) return [];
    // Orden: 1.Entrada(4), 2.Menú(1), 3.Carta(2), 4.Bebidas(3), 5.Otro(5)
    const order = { 4: 1, 1: 2, 2: 3, 3: 4, 5: 5 };
    
    return [...products].sort((a, b) => {
        const orderA = order[a.id_categoria] || 999;
        const orderB = order[b.id_categoria] || 999;
        return orderA - orderB;
    });
};

// Función para imprimir el ticket

// Función para imprimir el TICKET DE COMANDA (COCINA/BARRA)
const imprimirTicketComanda = (ticket) => {
    return new Promise((resolve, reject) => {
        try {
            const device = new Network(PRINTER_IP, PRINTER_PORT);
            const options = { encoding: "cp850" };
            const printer = new escpos.Printer(device, options);

            device.open(function (error) {
                if (error) {
                    console.error("Error al abrir impresora para pedido:", error);
                    return reject(error);
                }

                // Resetear impresora
                device.write(Buffer.from([0x1B, 0x40, 0x1C, 0x2E, 0x1B, 0x74, 0x02, 0x1B, 0x21, 0x00, 0x1D, 0x21, 0x00]));

                printer
                    .encode('cp850')
                    .align('lt')
                    .size(1, 1) // Doble altura para la mesa
                    .text(`MESA: ${ticket.mesa}`)
                    .size(0, 0)
                    .text(`ID: #${ticket.id_ticket}`)
                    .text(`Fecha: ${new Date(ticket.fecha_emision || Date.now()).toLocaleString('es-PE')}`)
                    .text('------------------------------------------------')
                    .size(0, 0)
                    .text('CANT  DESCRIPCION')
                    .text('------------------------------------------------');

                // Listar productos
                if (ticket.productos && ticket.productos.length > 0) {
                    const productosOrdenados = sortProductsByCategory(ticket.productos);
                    productosOrdenados.forEach(prod => {
                        const cantidad = String(prod.cantidad);
                        // Intentamos usar el nombre que viene del JSON, si no, un genérico
                        const nombre = prod.nombre || `Prod ID:${prod.id_producto}`;

                        // Formato: Cantidad (4) + Nombre
                        const colCant = cantidad.padEnd(4).substring(0, 4);

                        printer
                            .size(1, 1) // Texto grande para cocina
                            .text(`${colCant} ${nombre}`)
                            .size(0, 0);
                    });
                }

                printer.size(0, 0).text('------------------------------------------------');

                // Notas
                if (ticket.notas) {
                    printer
                        .align('ct')
                        .text('--- NOTAS ---')
                        .size(1, 1)
                        .text(ticket.notas)
                        .size(0, 0)
                        .text('------------------------------------------------');
                }

                // Total Estimado (Si existe, útil para pre-cuenta)
                if (ticket.total_estimado && ticket.total_estimado > 0) {
                    printer
                        .align('rt')
                        .text(`TOTAL EST.: S/ ${Number(ticket.total_estimado).toFixed(2)}`)
                        .align('lt');
                }

                printer.text('.').cut().close();
                resolve(true);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// Función para imprimir el REPORTE DIARIO DE VENTAS
const imprimirReporteDiario = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const device = new Network(PRINTER_IP, PRINTER_PORT);
            const options = { encoding: "cp850" };
            const printer = new escpos.Printer(device, options);

            device.open(function (error) {
                if (error) {
                    console.error("Error al abrir impresora para reporte:", error);
                    return reject(error);
                }

                // Resetear impresora
                device.write(Buffer.from([0x1B, 0x40, 0x1C, 0x2E, 0x1B, 0x74, 0x02, 0x1B, 0x21, 0x00, 0x1D, 0x21, 0x00]));

                printer
                    .encode('cp850')
                    .align('ct')
                    .size(1, 1)
                    .text('REPORTE DIARIO')
                    .size(0, 0)
                    .text('------------------------------------------------')
                    .align('lt')
                    .text(`FECHA: ${data.fecha}`)
                    .text(`IMPRESO: ${new Date().toLocaleTimeString('es-PE')}`)
                    .text('------------------------------------------------')
                    .text('CANT  PRODUCTO')
                    .text('------------------------------------------------');

                if (data.productos && data.productos.length > 0) {
                    data.productos.forEach(prod => {
                        const cantidad = String(prod.cantidad);
                        const nombre = prod.nombre;

                        // Formato: Cantidad (4) + Nombre
                        const colCant = cantidad.padEnd(4).substring(0, 4);

                        printer
                            .size(0, 0)
                            .text(`${colCant} ${nombre}`);
                    });
                } else {
                    printer.text('No hay ventas registradas.');
                }

                printer.text('------------------------------------------------');

                printer
                    .align('rt')
                    .size(1, 1)
                    .text(`TOTAL DIA: S/ ${Number(data.total).toFixed(2)}`)
                    .size(0, 0)
                    .align('lt')
                    .text('------------------------------------------------')
                    .text('.')
                    .cut()
                    .close();

                resolve(true);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// Función para imprimir NOTA DE VENTA (Simplificada)
const imprimirNotaVenta = (venta) => {
    return new Promise((resolve, reject) => {
        try {
            // Datos de la empresa
            const empresa = {
                ruc: '20999999991',
                razonSocial: 'PK2 - RESTAURANT',
                direccion: 'Av. Independencia 685, Moche 13600'
            };

            const total = Number(venta.total_venta) || 0;
            // Nota de venta no suele desglosar IGV obligatoriamente, pero lo haremos por si acaso o simple
            // En nota de venta, a veces solo es el total. Haremos algo simple.

            // Serie y Numero
            const idTicket = String(venta.id_ticket).padStart(8, '0');

            // --- IMPRESIÓN REAL (RED / WIFI) ---
            const device = new Network(PRINTER_IP, PRINTER_PORT);
            const options = { encoding: "cp850" };
            const printer = new escpos.Printer(device, options);

            const imprimirContenido = () => {
                // Encabezado
                printer
                    .encode('cp850')
                    .align('ct')
                    .text(empresa.razonSocial)
                    .text(empresa.direccion)
                    .text(`RUC: ${empresa.ruc}`)
                    .text('------------------------------------------------')
                    .text('NOTA DE VENTA')
                    .text(`NRO: ${idTicket}`)
                    .text('------------------------------------------------');

                // Info Cliente (Genérico)
                printer
                    .align('lt')
                    .text(`FECHA: ${new Date(venta.fecha_emision || Date.now()).toLocaleString('es-PE')}`)
                    .text('CLIENTE: PUBLICO GENERAL')
                    .text('------------------------------------------------')
                    .text('CAN  PRODUCTO                 P.UNIT     TOTAL')
                    .text('------------------------------------------------');

                // Productos
                if (venta.productos && venta.productos.length > 0) {
                    const productosOrdenados = sortProductsByCategory(venta.productos);
                    productosOrdenados.forEach(prod => {
                        const nombreProducto = prod.nombre || `Producto ${prod.id_producto}`;
                        const precio = Number(prod.precio_unitario).toFixed(2);
                        const subtotal = Number(prod.subtotal).toFixed(2);
                        const cantidad = String(prod.cantidad);

                        // Formato similar al ticket
                        const colCant = cantidad.padEnd(4).substring(0, 4);
                        const colProd = nombreProducto.padEnd(22).substring(0, 22);
                        const colPrec = precio.padStart(9).substring(0, 9);
                        const colTotal = subtotal.padStart(10).substring(0, 10);

                        printer.text(`${colCant} ${colProd} ${colPrec} ${colTotal}`);
                    });
                }

                // Total
                printer
                    .align('lt')
                    .text('------------------------------------------------')
                    .align('rt')
                    .size(1, 1)
                    .text(`TOTAL: S/ ${total.toFixed(2)}`)
                    .size(0, 0)
                    .align('ct')
                    .text('------------------------------------------------')
                    .text('Gracias por su preferencia')
                    .text('.')
                    .cut()
                    .close();
            };

            device.open(function (error) {
                if (error) {
                    console.error("Error al abrir impresora (Nota Venta):", error);
                    return reject(error);
                }

                // Reset y Configuración
                device.write(Buffer.from([0x1B, 0x40, 0x1C, 0x2E, 0x1B, 0x74, 0x02, 0x1B, 0x21, 0x00, 0x1D, 0x21, 0x00]));

                // Intentar logo (opcional, igual que el ticket)
                const logoPath = path.join(__dirname, '../public/images/logo2.png');
                if (fs.existsSync(logoPath)) {
                    escpos.Image.load(logoPath, function (image) {
                        printer.align('ct').image(image, 's8').then(() => {
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
            console.error("Error en imprimirNotaVenta:", err);
            reject(err);
        }
    });
};

module.exports = { imprimirTicketComanda, imprimirReporteDiario, imprimirNotaVenta };