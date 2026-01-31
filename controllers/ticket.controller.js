const Ticket = require('../models/ticket.model');
const Product = require('../models/product.model');
const { imprimirTicketComanda, imprimirReporteDiario, imprimirNotaVenta } = require('../utils/printer');

// --- CONFIGURACIÓN DE REGLAS DE NEGOCIO ---
const ID_CAT_MENU = 1;  
const ID_CAT_ENTRADA = 4; 

// Helper para aplicar la regla: Menu + Entrada = 12.00
const aplicarReglaMenu = (productos) => {
    // 1. Contar totales por categoría
    const totalMenus = productos.reduce((sum, p) => p.id_categoria === ID_CAT_MENU ? sum + p.cantidad : sum, 0);
    const totalEntradas = productos.reduce((sum, p) => p.id_categoria === ID_CAT_ENTRADA ? sum + p.cantidad : sum, 0);
    
    // 2. Calcular pares posibles
    const pares = Math.min(totalMenus, totalEntradas);
    
    if (pares > 0) {
        let menusPaired = 0;
        let entradasPaired = 0;

        productos.forEach(p => {
            if (p.id_categoria === ID_CAT_MENU) {
                const cant = p.cantidad;
                const porEmparejar = Math.max(0, pares - menusPaired);
                const emparejados = Math.min(cant, porEmparejar);
                
                if (emparejados > 0) {
                    // Precio ponderado: (Emparejados * 12.00 + Resto * PrecioOriginal) / Total
                    const precioOriginal = Number(p.precio_unitario);
                    const nuevoPrecio = ((emparejados * 12.00) + ((cant - emparejados) * precioOriginal)) / cant;
                    p.precio_unitario = nuevoPrecio;
                    menusPaired += emparejados;
                }
            } else if (p.id_categoria === ID_CAT_ENTRADA) {
                const cant = p.cantidad;
                const porEmparejar = Math.max(0, pares - entradasPaired);
                const emparejados = Math.min(cant, porEmparejar);
                
                if (emparejados > 0) {
                    // Precio ponderado: (Emparejados * 0.00 + Resto * PrecioOriginal) / Total
                    const precioOriginal = Number(p.precio_unitario);
                    const nuevoPrecio = ((emparejados * 0.00) + ((cant - emparejados) * precioOriginal)) / cant;
                    p.precio_unitario = nuevoPrecio;
                    entradasPaired += emparejados;
                }
            }
        });
    }
    return productos;
};

const createTicketAndPrint = async (req, res) => {
    const ticketData = req.body;

    try {
        // 1. Validar datos mínimos
        if (!ticketData.mesa || !ticketData.productos || ticketData.productos.length === 0) {
            return res.status(400).json({ message: 'Faltan datos: mesa o productos.' });
        }

        // VALIDACIÓN: Verificar precios negativos
        const productoNegativo = ticketData.productos.find(p => p.precio_unitario !== undefined && Number(p.precio_unitario) < 0);
        if (productoNegativo) {
            return res.status(400).json({ 
                message: `El precio no puede ser negativo. Producto: ${productoNegativo.nombre || 'ID ' + productoNegativo.id_producto}` 
            });
        }

        // 2. Enriquecer datos ANTES de guardar (Nombres y Precios)
        // Esto permite que funcione tanto si envían nombres (Web) como si solo envían IDs (App Móvil)
        const productosConNombres = await Promise.all(ticketData.productos.map(async (item) => {
            // Si ya viene el nombre y precio, lo usamos
            if (item.nombre && item.precio_unitario !== undefined) return item;

            // Si no, lo buscamos en la BD
            const productoBD = await Product.findById(item.id_producto);
            return {
                ...item,
                id_categoria: productoBD ? productoBD.id_categoria : null, // Necesario para la regla
                nombre: item.nombre || (productoBD ? productoBD.nombre : 'Producto Desconocido'),
                precio_unitario: item.precio_unitario !== undefined ? item.precio_unitario : (productoBD ? productoBD.precio : 0)
            };
        }));

        // 3. Aplicar Regla de Negocio (Menu + Entrada = 12)
        const productosProcesados = aplicarReglaMenu(productosConNombres);
        const nuevoTotalEstimado = productosProcesados.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);

        // 4. Guardar en BD
        const ticketParaGuardar = { ...ticketData, productos: productosProcesados, total_estimado: nuevoTotalEstimado };
        const nuevoTicket = await Ticket.create(ticketParaGuardar);

        const ticketParaImprimir = {
            ...nuevoTicket,
            productos: productosProcesados
        };

        // 5. Imprimir
        try {
            // Esta línea permite imprimir si se crea el pedido desde Postman o una futura Web de Meseros.
            // (Actualmente la App Móvil usa su propia ruta y el Panel Web no crea pedidos, por lo que esto no se ejecuta en el flujo diario)
            await imprimirTicketComanda(ticketParaImprimir);
            res.status(201).json({
                message: 'Pedido registrado y enviado a cocina.',
                id_ticket: nuevoTicket.id_ticket,
                ticket: nuevoTicket
            });
        } catch (printError) {
            console.error("Error imprimiendo ticket cocina:", printError);
            res.status(207).json({ message: 'Pedido guardado, pero error al imprimir.', ticket: nuevoTicket });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error al procesar el pedido.', error: error.message });
    }
};

const getTicketsByDate = async (req, res) => {
    try {
        const { fecha } = req.query; // Esperamos ?fecha=YYYY-MM-DD
        if (!fecha) return res.status(400).json({ message: 'Se requiere el parámetro fecha' });

        const tickets = await Ticket.findByDate(fecha);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reporte', error: error.message });
    }
};

const printDailyReport = async (req, res) => {
    try {
        const { fecha } = req.body;
        if (!fecha) return res.status(400).json({ message: 'Se requiere la fecha para imprimir el reporte' });

        // Obtener estadísticas del modelo
        const stats = await Ticket.getDailyStats(fecha);

        try {
            await imprimirReporteDiario({ fecha, ...stats });
            res.json({ message: 'Reporte impreso correctamente' });
        } catch (printError) {
            console.error("Error imprimiendo reporte:", printError);
            res.status(500).json({ message: 'Error al conectar con la impresora. Revise la IP y conexión.' });
        }
    } catch (error) {
        console.error("Error en printDailyReport:", error);
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
    }
};

const printNotaVenta = async (req, res) => {
    try {
        const { id_ticket } = req.body;
        if (!id_ticket) return res.status(400).json({ message: 'Se requiere id_ticket' });

        // 1. Obtener ticket con productos desde la BD
        const ticketFull = await Ticket.getByIdWithDetails(id_ticket);

        if (!ticketFull) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        // 2. Imprimir
        await imprimirNotaVenta(ticketFull);
        res.json({ message: 'Nota de venta impresa correctamente' });

    } catch (error) {
        console.error("Error al imprimir nota de venta:", error);
        res.status(500).json({ message: 'Error al imprimir nota de venta', error: error.message });
    }
};

const reprintTicketComanda = async (req, res) => {
    try {
        const { id_ticket } = req.body;
        if (!id_ticket) return res.status(400).json({ message: 'Se requiere id_ticket' });

        // 1. Obtener ticket con productos desde la BD
        const ticketFull = await Ticket.getByIdWithDetails(id_ticket);

        if (!ticketFull) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        // 2. Imprimir Comanda nuevamente
        await imprimirTicketComanda(ticketFull);
        res.json({ message: 'Ticket de comanda reenviado a cocina correctamente' });

    } catch (error) {
        console.error("Error al reimprimir comanda:", error);
        res.status(500).json({ message: 'Error al reimprimir comanda', error: error.message });
    }
};

const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.getByIdWithDetails(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ticket', error: error.message });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticketData = req.body; // { mesa, notas, productos, total_estimado }
        
        // VALIDACIÓN: Verificar precios negativos
        if (ticketData.productos && Array.isArray(ticketData.productos)) {
            const productoNegativo = ticketData.productos.find(p => p.precio_unitario !== undefined && Number(p.precio_unitario) < 0);
            if (productoNegativo) {
                return res.status(400).json({ 
                    message: `El precio no puede ser negativo. Producto: ${productoNegativo.nombre || 'ID ' + productoNegativo.id_producto}` 
                });
            }
        }

        // --- LÓGICA DE REGLA DE NEGOCIO PARA UPDATE ---
        // Necesitamos enriquecer los productos con su categoría para aplicar la regla
        const productosEnriquecidos = await Promise.all(ticketData.productos.map(async (item) => {
            const productoBD = await Product.findById(item.id_producto);
            
            // FIX: Resetear precio a valor de catálogo para Menu y Entrada para recalcular combo correctamente
            let precioParaCalculo = item.precio_unitario;
            if (productoBD && (productoBD.id_categoria === ID_CAT_MENU || productoBD.id_categoria === ID_CAT_ENTRADA)) {
                precioParaCalculo = Number(productoBD.precio);
            }

            return {
                ...item,
                id_categoria: productoBD ? productoBD.id_categoria : null,
                precio_unitario: precioParaCalculo
            };
        }));

        const productosProcesados = aplicarReglaMenu(productosEnriquecidos);
        const nuevoTotal = productosProcesados.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);

        // Guardar con precios ajustados
        await Ticket.update(id, { ...ticketData, productos: productosProcesados, total_estimado: nuevoTotal });

        // --- NUEVO: Reimprimir para cocina ---
        const ticketActualizado = await Ticket.getByIdWithDetails(id);
        if (ticketActualizado) {
             // Agregamos una nota automática de "MODIFICADO"
             const ticketParaImprimir = {
                 ...ticketActualizado,
                 notas: `*** MODIFICADO ***\n${ticketActualizado.notas || ''}`
             };
             
             try {
                await imprimirTicketComanda(ticketParaImprimir);
             } catch(e) {
                 console.error("Error al imprimir ticket modificado:", e);
             }
        }

        res.json({ message: 'Ticket actualizado y reimpreso correctamente' });
    } catch (error) {
        console.error("Error en updateTicket:", error);
        res.status(500).json({ message: 'Error al actualizar ticket', error: error.message });
    }
};

module.exports = { createTicketAndPrint, getTicketsByDate, printDailyReport, printNotaVenta, reprintTicketComanda, getTicketById, updateTicket };