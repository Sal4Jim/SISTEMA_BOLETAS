const express = require('express');
const { testConnection } = require('./config/database');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static('public')); 


// Ruta de prueba para la base de datos
app.get('/test-db', async (req, res) => {
    const result = await testConnection();
    res.json(result);
});

// Ruta de prueba del servidor
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

// Aquí irán las rutas de la aplicación
app.use('/api/productos', require('./routes/product.routes'));
app.use('/api/boletas', require('./routes/boleta.routes'));



const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    // Probar conexión a la base de datos al iniciar
    console.log('🔌 Probando conexión a la base de datos...');
    const dbResult = await testConnection();
    console.log(dbResult.success ? '✅ Base de datos conectada correctamente' : `❌ ${dbResult.message}`);
});