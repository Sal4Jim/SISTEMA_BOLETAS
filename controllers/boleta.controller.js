const Boleta = require('../models/boleta.model');
const { imprimirTicket } = require('../utils/printer');

const createBoletaAndPrint = async (req, res) => {
    // El objeto `venta` viene del frontend
    const ventaData = req.body;

    try {
        // 1. Guardar la boleta en la base de datos
        const nuevaBoleta = await Boleta.create(ventaData);

        // 2. Si se guarda correctamente, intentar imprimir
        try {
            // Combinamos los datos:
            // - ventaData: tiene la lista de 'productos' que envió el frontend
            // - nuevaBoleta: tiene el 'correlativo', 'id_boleta' y 'fecha_emision' generados por la BD
            const ticketData = {
                ...ventaData,
                ...nuevaBoleta
            };
            await imprimirTicket(ticketData);

            // Si todo fue bien (guardado e impreso)
            res.status(201).json({
                message: 'Venta registrada e ticket enviado a imprimir.',
                boleta: nuevaBoleta
            });

        } catch (printError) {
            // Si falla la impresión pero la venta SÍ se guardó
            res.status(207).json({ message: 'Venta registrada, pero hubo un error al imprimir el ticket.', error: printError.message, boleta: nuevaBoleta });
        }
    } catch (dbError) {
        // Si falla al guardar en la base de datos
        res.status(500).json({ message: 'Error al registrar la venta en la base de datos.', error: dbError.message });
    }
};

module.exports = {
    createBoletaAndPrint
};