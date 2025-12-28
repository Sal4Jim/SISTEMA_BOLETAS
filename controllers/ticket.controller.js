const Ticket = require('../models/ticket.model');
const Product = require('../models/product.model');
const { imprimirTicketComanda, imprimirReporteDiario } = require('../utils/printer');

const createTicketAndPrint = async (req, res) => {
    const ticketData = req.body;

    try {
        // 1. Validar datos mínimos
        if (!ticketData.mesa || !ticketData.productos || ticketData.productos.length === 0) {
            return res.status(400).json({ message: 'Faltan datos: mesa o productos.' });
        }

        // 2. Guardar en BD
        const nuevoTicket = await Ticket.create(ticketData);

        // 3. Enriquecer datos para la impresión (Nombres de productos)
        // Esto permite que funcione tanto si envían nombres (Web) como si solo envían IDs (App Móvil)
        const productosConNombres = await Promise.all(ticketData.productos.map(async (item) => {
            // Si ya viene el nombre, lo usamos
            if (item.nombre) return item;

            // Si no, lo buscamos en la BD
            const productoBD = await Product.findById(item.id_producto);
            return {
                ...item,
                nombre: productoBD ? productoBD.nombre : 'Producto Desconocido'
            };
        }));

        const ticketParaImprimir = {
            ...nuevoTicket,
            productos: productosConNombres
        };

        // 4. Imprimir (No bloqueamos la respuesta si falla la impresión, pero avisamos)
        try {
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

module.exports = { createTicketAndPrint, getTicketsByDate, printDailyReport };