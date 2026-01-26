const net = require('net');

// CONFIGURA AQUÍ LA IP QUE QUIERES PROBAR
const HOST = '192.168.100.64';
const HOST = '192.168.0.200';
const PORT = 9100;

console.log(`📡 Intentando conectar a la impresora en ${HOST}:${PORT}...`);
console.log('⏳ Esperando respuesta (Timeout: 5s)...');

const client = new net.Socket();
client.setTimeout(5000); // 5 segundos máximo

client.connect(PORT, HOST, () => {
    console.log('\n✅ ¡CONEXIÓN EXITOSA!');
    console.log('>>> Tu PC SÍ puede ver a la impresora.');
    console.log('>>> Si el sistema falla, es probable que el puerto se quede "pegado" por peticiones anteriores.');
    client.destroy();
});

client.on('data', (data) => {
    console.log('Datos recibidos: ' + data);
    client.destroy();
});

client.on('error', (err) => {
    console.error('\n❌ ERROR DE CONEXIÓN:');
    console.error(`Código: ${err.code}`);
    
    if (err.code === 'ETIMEDOUT') {
        console.log('⚠️ CAUSA: El servidor no recibe respuesta.');
        console.log('   1. Verifica que tu PC tenga una IP en el rango 192.168.100.x');
        console.log('   2. Verifica que el cable de red de la impresora esté bien conectado.');
    } else if (err.code === 'EHOSTUNREACH') {
        console.log('⚠️ CAUSA: Tu PC no sabe cómo llegar a esa red (Rutas/Gateway incorrectos).');
    }
});

client.on('timeout', () => {
    console.error('\n⏰ TIEMPO DE ESPERA AGOTADO (Timeout).');
    client.destroy();
});