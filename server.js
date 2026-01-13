const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();

// Middlewares
app.use(cors({
    origin: '*', // Permite todas las origenes (en producción especifica tu dominio)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Manejar preflight OPTIONS
app.options(/.* /, cors());

// Ruta de prueba para la base de datos
app.get('/test-db', async (req, res) => {
    const result = await testConnection();
    res.json(result);
});

// Ruta de prueba del servidor
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Aquí irán las rutas de la aplicación
app.use('/api/productos', require('./routes/product.routes'));
app.use('/api/boletas', require('./routes/boleta.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));
app.use('/api/categorias', require('./routes/category.routes'));

// Ruta para la app móvil
app.use('/api/mobile/productos', require('./routes/mobile/productos'));
app.use('/api/mobile/categorias', require('./routes/mobile/categorias'));
app.use('/api/mobile/pedidos', require('./routes/mobile/pedidos'));

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

    // Probar conexión a la base de datos al iniciar
    console.log('🔌 Probando conexión a la base de datos...');
    const dbResult = await testConnection();
    console.log(dbResult.success ? '✅ Base de datos conectada correctamente' : `❌ ${dbResult.message}`);
});