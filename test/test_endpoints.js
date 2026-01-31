
const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(dataString)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: body });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(dataString);
        req.end();
    });
}

async function run() {
    // Data for /api/mobile/pedidos
    const mobileData = {
        mesa: "TestMesa",
        total_estimado: 10,
        productos: [{ id_producto: 1, cantidad: 1 }]
    };

    // Data for /api/tickets
    const ticketData = {
        mesa: "TestMesaTicket",
        productos: [{ id_producto: 1, id: 1, cantidad: 1, nombre: "TestProd" }], // id_producto or id?
        // ticket.controller expects: mesa, productos.
        // inside map: item.id_producto
    };

    try {
        console.log("--- Testing /api/mobile/pedidos ---");
        const resMobile = await postRequest('/api/mobile/pedidos', mobileData);
        console.log("Status:", resMobile.status);
        console.log("Body:", resMobile.body);

        console.log("\n--- Testing /api/tickets ---");
        const resTicket = await postRequest('/api/tickets', ticketData);
        console.log("Status:", resTicket.status);
        console.log("Body:", resTicket.body);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
