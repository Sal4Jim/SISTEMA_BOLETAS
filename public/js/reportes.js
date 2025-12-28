document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha-reporte');
    const tablaBody = document.getElementById('tabla-reportes-body');
    const relojEl = document.getElementById('reloj-tiempo-real');
    const totalTicketsEl = document.getElementById('total-tickets-count');
    const totalEstimadoEl = document.getElementById('total-estimado-sum');
    const btnImprimir = document.getElementById('btn-imprimir-reporte');

    // 1. Configurar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;

    // 2. Reloj en tiempo real
    const actualizarReloj = () => {
        const ahora = new Date();
        relojEl.textContent = ahora.toLocaleString('es-PE', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
    };
    setInterval(actualizarReloj, 1000);
    actualizarReloj();

    // 3. Cargar Reporte
    const cargarReporte = async () => {
        const fecha = fechaInput.value;
        if (!fecha) return;

        try {
            const res = await fetch(`/api/tickets/reporte?fecha=${fecha}`);
            const tickets = await res.json();

            tablaBody.innerHTML = '';
            let sumaTotal = 0;

            if (tickets.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay tickets registrados para esta fecha.</td></tr>';
            } else {
                tickets.forEach(ticket => {
                    const hora = new Date(ticket.fecha_emision).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                    sumaTotal += Number(ticket.total_estimado || 0);

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${hora}</td>
                        <td>#${ticket.id_ticket}</td>
                        <td>${ticket.mesa}</td>
                        <td>${ticket.notas || '-'}</td>
                        <td>S/ ${Number(ticket.total_estimado || 0).toFixed(2)}</td>
                    `;
                    tablaBody.appendChild(tr);
                });
            }

            // Actualizar tarjetas de resumen
            totalTicketsEl.textContent = tickets.length;
            totalEstimadoEl.textContent = `S/ ${sumaTotal.toFixed(2)}`;

        } catch (error) {
            console.error('Error cargando reporte:', error);
            tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar datos.</td></tr>';
        }
    };

    // Eventos
    fechaInput.addEventListener('change', cargarReporte);
    
    btnImprimir.addEventListener('click', async () => {
        const fecha = fechaInput.value;
        if (!fecha) return;

        if (!confirm(`¿Desea imprimir el reporte del día ${fecha}?`)) return;

        try {
            const res = await fetch('/api/tickets/reporte/imprimir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha })
            });
            
            // Verificar si la respuesta es JSON válido antes de parsear
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await res.json();
                if (res.ok) {
                    alert(result.message);
                } else {
                    alert('Error del servidor: ' + result.message);
                }
            } else {
                // Si no es JSON (ej. error 404 o 500 en HTML)
                const text = await res.text();
                console.error('Respuesta no válida del servidor:', text);
                throw new Error(`El servidor devolvió un error (${res.status}). Revisa la consola (F12) para más detalles.`);
            }
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al solicitar impresión: ' + error.message);
        }
    });
    
    // Carga inicial
    cargarReporte();
});