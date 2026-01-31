const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/usuario.model');

// Clave secreta
const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback_key';

// Middleware de Autenticación para Reportes
const verifyToken = (req, res, next) => {
    // Permitir OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: Token requerido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

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

// Auth Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Protegemos las rutas relacionadas a los REPORTES
// NOTA: Si hay rutas específicas de reportes en ticket.routes, idealmente las separaríamos.
// Por ahora, aplicamos middleware a rutas específicas que sabemos que son de reportes.
// OJO: Si '/api/tickets' se usa para todo, bloqueará todo. 
// Vamos a inspeccionar ticket.routes.js para ver cual usa el reporte.
// Segun index.js: fetch('/api/tickets/reporte?fecha=${fecha}')
// Entonces interceptamos esa URL específica antes de cargar el router general si es posible, 
// o aplicamos el middleware en ticket.routes.js.
// Estrategia: Aplicar middleware global selectivo.

app.use('/api/tickets/reporte', verifyToken); // Protege especificamente la ruta de reportes
app.use('/api/tickets/reporte/imprimir', verifyToken); // Protege la impresion de reportes

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

    // Seeding de Usuario Admin por defecto
    try {
        const count = await Usuario.count();
        if (count === 0) {
            console.log('⚠️ No se encontraron usuarios. Creando usuario admin por defecto...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Usuario.create('admin', hashedPassword, 'admin');
            console.log('✅ Usuario creado: admin / admin123');
        }
    } catch (error) {
        console.error('❌ Error en seeding de usuarios:', error);
    }
});