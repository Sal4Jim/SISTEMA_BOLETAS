const express = require('express');
const router = express.Router();
const { createTicketAndPrint } = require('../controllers/ticket.controller');

router.post('/', createTicketAndPrint);

module.exports = router;