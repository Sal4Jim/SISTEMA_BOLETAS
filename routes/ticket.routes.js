const express = require('express');
const router = express.Router();
const { createTicketAndPrint, getTicketsByDate, printDailyReport, printNotaVenta } = require('../controllers/ticket.controller');

router.post('/', createTicketAndPrint);
router.get('/reporte', getTicketsByDate);
router.post('/reporte/imprimir', printDailyReport);
router.post('/print-nota', printNotaVenta);

module.exports = router;