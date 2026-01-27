const express = require('express');
const router = express.Router();
const { createTicketAndPrint, getTicketsByDate, printDailyReport, printNotaVenta, reprintTicketComanda } = require('../controllers/ticket.controller');

router.post('/', createTicketAndPrint);
router.get('/reporte', getTicketsByDate);
router.post('/reporte/imprimir', printDailyReport);
router.post('/print-nota', printNotaVenta);
router.post('/reprint-comanda', reprintTicketComanda);

module.exports = router;