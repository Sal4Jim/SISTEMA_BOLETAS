const os = require('os');

console.log('\n🔍 ANALIZANDO TU RED LOCAL...');
const interfaces = os.networkInterfaces();
let found = false;

Object.keys(interfaces).forEach((ifname) => {
  interfaces[ifname].forEach((iface) => {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return; // Saltar direcciones internas
    }

    console.log(`\nTarjeta de Red: ${ifname}`);
    console.log(`👉 Tu IP actual:  ${iface.address}`);
    
    const parts = iface.address.split('.');
    const subnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
    
    if (subnet === '192.168.100') {
        console.log('✅ ESTÁS EN EL RANGO CORRECTO (192.168.100.x)');
        found = true;
    } else {
        console.log(`⚠️ RANGO DIFERENTE. La impresora está en 192.168.100.x, tú estás en ${subnet}.x`);
    }
  });
});

if (!found) {
    console.log('\n❌ CONCLUSIÓN: Tu PC y la impresora no se pueden comunicar.');
    console.log('   SOLUCIÓN RÁPIDA: Cambia la IP de tu PC a una fija como 192.168.100.50');
} else {
    console.log('\n✅ CONCLUSIÓN: La red parece correcta. Verifica el cable de red o firewall.');
}