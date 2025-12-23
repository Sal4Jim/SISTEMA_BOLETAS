const express = require('express');
const router = express.Router();
const { createBoletaAndPrint } = require('../controllers/boleta.controller');

// Ruta para crear una nueva boleta y mandarla a imprimir
router.post('/', createBoletaAndPrint);

module.exports = router;