const Ticket = require('../models/ticket.model');
const { imprimirTicketPedido } = require('../utils/printer');

const createTicketAndPrint = async (req, res) => {
    const ticketData = req.body;

    try {
        // 1. Validar datos mínimos
        if (!ticketData.mesa || !ticketData.productos || ticketData.productos.length === 0) {
            return res.status(400).json({ message: 'Faltan datos: mesa o productos.' });
        }

        // 2. Guardar en BD
        const nuevoTicket = await Ticket.create(ticketData);

        // 3. Imprimir (No bloqueamos la respuesta si falla la impresión, pero avisamos)
        try {
            await imprimirTicketPedido(nuevoTicket);
            res.status(201).json({ 
                message: 'Pedido registrado y enviado a cocina.', 
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