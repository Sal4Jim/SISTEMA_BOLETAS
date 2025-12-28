const express = require('express');
const router = express.Router();
const { createTicketAndPrint, getTicketsByDate, printDailyReport } = require('../controllers/ticket.controller');

router.post('/', createTicketAndPrint);
router.get('/reporte', getTicketsByDate);
router.post('/reporte/imprimir', printDailyReport);

module.exports = router;