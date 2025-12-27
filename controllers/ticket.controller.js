const Ticket = require('../models/ticket.model');
const Product = require('../models/product.model');
const { imprimirTicketComanda } = require('../utils/printer');

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

module.exports = { createTicketAndPrint };