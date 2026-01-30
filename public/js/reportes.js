document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha-reporte');
    const tablaBody = document.getElementById('tabla-reportes-body');
    const relojEl = document.getElementById('reloj-tiempo-real');
    const totalTicketsEl = document.getElementById('total-tickets-count');
    const totalEstimadoEl = document.getElementById('total-estimado-sum');
    const btnImprimir = document.getElementById('btn-imprimir-reporte');

    // --- Elementos del Modal ---
    const modalEditar = document.getElementById('modalEditarTicket');
    const spanClose = document.querySelector('.close-modal-edit');
    const formEditar = document.getElementById('formEditarTicket');
    const inputId = document.getElementById('editTicketId');
    const inputMesa = document.getElementById('editMesa');
    const inputNotas = document.getElementById('editNotas');
    const modalTitle = document.getElementById('modalTitleEdit');
    
    // Elementos nuevos para productos
    const catalogListEl = document.getElementById('catalog-list');
    const listProductsEdit = document.getElementById('list-products-edit');
    const filterProductInput = document.getElementById('filter-product-modal');
    let currentEditingProducts = []; // Array para manejar los productos en memoria
    let catalogoProductos = []; // Catálogo completo

    // 1. Configurar fecha actual por defecto
    const fechaPeru = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    fechaInput.value = fechaPeru;

    // 2. Reloj en tiempo real
    const actualizarReloj = () => {
        const ahora = new Date();
        relojEl.textContent = ahora.toLocaleString('es-PE', {
            timeZone: 'America/Lima',
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
                tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay tickets registrados para esta fecha.</td></tr>';
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
                        <td>
                            <button class="btn-editar btn-imprimir-nota btn-table" data-id="${ticket.id_ticket}">🖨️ Nota de venta</button>
                        </td>
                        <td>
                            <button class="btn-editar btn-reimprimir-comanda btn-table btn-kitchen" data-id="${ticket.id_ticket}">👨‍🍳 Cocina</button>
                        </td>
                        <td>
                            <button class="btn-editar btn-modificar-ticket btn-table btn-edit-blue" data-id="${ticket.id_ticket}">✏️ Editar</button>
                        </td>
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

    // Función para agregar producto al ticket (Lógica movida aquí)
    const agregarProductoAlTicket = (prod) => {
        const existente = currentEditingProducts.find(p => p.id_producto == prod.id_producto);
        if (existente) {
            existente.cantidad++;
        } else {
            currentEditingProducts.push({
                id_producto: prod.id_producto,
                nombre: prod.nombre,
                precio_unitario: Number(prod.precio),
                id_categoria: Number(prod.id_categoria),
                cantidad: 1
            });
        }
        renderModalProducts();
    };

    // Función auxiliar para renderizar el catálogo (LISTA en vez de SELECT)
    const renderizarCatalogo = (lista, terminoResaltar = '') => {
        catalogListEl.innerHTML = '';
        
        if (lista.length === 0) {
            catalogListEl.innerHTML = '<div style="padding:8px; color:#888; text-align:center;">No se encontraron productos</div>';
            return;
        }

        lista.forEach(p => {
            const div = document.createElement('div');
            div.className = 'catalog-item';
            
            let nombreHtml = p.nombre;
            if (terminoResaltar) {
                // Escapar caracteres especiales para regex y resaltar
                const term = terminoResaltar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${term})`, 'gi');
                nombreHtml = p.nombre.replace(regex, '<b>$1</b>');
            }

            div.innerHTML = `
                <span>${nombreHtml}</span>
                <span style="font-size:0.85rem; color:#666; margin-left:10px;">S/ ${Number(p.precio).toFixed(2)}</span>
            `;
            
            div.onclick = () => agregarProductoAlTicket(p);
            catalogListEl.appendChild(div);
        });
    };

    // 4. Cargar Catálogo de Productos (para el select del modal)
    const cargarCatalogo = async () => {
        try {
            const res = await fetch('/api/productos');
            const data = await res.json();
            if (Array.isArray(data)) {
                catalogoProductos = data;
                renderizarCatalogo(catalogoProductos);
            }
        } catch (error) {
            console.error('Error cargando catálogo:', error);
        }
    };
    cargarCatalogo();

    // Filtro de productos en el modal
    filterProductInput.addEventListener('input', (e) => {
        const rawTerm = e.target.value;
        const terminoNorm = rawTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const filtrados = catalogoProductos.filter(p => {
            const nombreNorm = (p.nombre || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nombreNorm.includes(terminoNorm);
        });
        renderizarCatalogo(filtrados, rawTerm);
    });

    // Renderizar lista de productos en el modal
    const renderModalProducts = () => {
        listProductsEdit.innerHTML = '';
        currentEditingProducts.forEach((prod, index) => {
            // Bloquear edición de precio si es Menú (1) o Entrada (4)
            const isLocked = (prod.id_categoria == 1 || prod.id_categoria == 4);
            
            const li = document.createElement('li');
            li.className = 'product-item-edit';
            li.innerHTML = `
                <span title="${prod.nombre}">${prod.nombre}</span>
                <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap; justify-content:flex-end;">
                    <input type="number" step="0.01" value="${Number(prod.precio_unitario).toFixed(2)}" class="price-input" data-index="${index}" style="width:70px; padding:2px;" placeholder="S/" ${isLocked ? 'disabled style="background-color:#eee; color:#888;"' : ''}>
                    <input type="number" min="1" value="${prod.cantidad}" class="qty-input" data-index="${index}" style="width:50px; padding:2px;">
                    <button type="button" class="btn-remove-prod" data-index="${index}">X</button>
                </div>
            `;
            listProductsEdit.appendChild(li);
        });

        // Listeners para cambios
        document.querySelectorAll('.qty-input').forEach(input => {
            input.onchange = (e) => {
                const idx = e.target.dataset.index;
                const val = parseInt(e.target.value);
                if (val > 0) currentEditingProducts[idx].cantidad = val;
                else e.target.value = 1;
            };
        });

        document.querySelectorAll('.price-input').forEach(input => {
            input.onchange = (e) => {
                const idx = e.target.dataset.index;
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) currentEditingProducts[idx].precio_unitario = val;
            };
        });

        document.querySelectorAll('.btn-remove-prod').forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.target.dataset.index;
                currentEditingProducts.splice(idx, 1);
                renderModalProducts();
            };
        });
    };

    // --- Lógica del Modal ---
    // Cerrar modal
    spanClose.onclick = () => modalEditar.style.display = "none";
    window.onclick = (event) => { if (event.target == modalEditar) modalEditar.style.display = "none"; };

    // Guardar cambios
    formEditar.onsubmit = async (e) => {
        e.preventDefault();
        const id = inputId.value;
        const mesa = inputMesa.value;
        const notas = inputNotas.value;
        
        // Calcular nuevo total estimado
        let nuevoTotal = 0;
        currentEditingProducts.forEach(p => {
            // Usamos el precio_unitario que tiene el objeto (ya sea el original o el editado)
            const precio = Number(p.precio_unitario || 0);
            nuevoTotal += precio * p.cantidad;
        });

        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mesa, notas, productos: currentEditingProducts, total_estimado: nuevoTotal })
            });

            if (res.ok) {
                alert('Ticket actualizado correctamente');
                modalEditar.style.display = "none";
                cargarReporte(); // Recargar tabla para ver cambios
            } else {
                const data = await res.json();
                alert('Error: ' + (data.message || 'No se pudo actualizar'));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión al actualizar');
        }
    };

    // Eventos
    tablaBody.addEventListener('click', async (e) => {
        // --- NUEVO: Botón Modificar Ticket ---
        if (e.target.classList.contains('btn-modificar-ticket')) {
            const idTicket = e.target.getAttribute('data-id');
            
            try {
                // Obtener detalles completos del servidor
                const res = await fetch(`/api/tickets/${idTicket}`);
                const ticket = await res.json();

                inputId.value = ticket.id_ticket;
                inputMesa.value = ticket.mesa;
                inputNotas.value = ticket.notas || '';
                currentEditingProducts = ticket.productos || []; // Cargar productos
                renderModalProducts();

                // Resetear filtro y lista de productos al abrir
                filterProductInput.value = '';
                renderizarCatalogo(catalogoProductos);

                modalTitle.textContent = `Editar Ticket #${idTicket}`;
                modalEditar.style.display = "block";
            } catch (err) {
                console.error(err);
                alert('Error al cargar detalles del ticket');
            }
            return;
        }

        // --- NUEVO: Botón Reimprimir Comanda (Cocina) ---
        if (e.target.classList.contains('btn-reimprimir-comanda')) {
            const idTicket = e.target.getAttribute('data-id');
            const btn = e.target;

            if (!confirm(`¿Reimprimir Comanda para Cocina (Ticket #${idTicket})?`)) return;

            const originalText = btn.textContent;
            btn.textContent = '...';
            btn.disabled = true;

            try {
                const response = await fetch('/api/tickets/reprint-comanda', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_ticket: idTicket })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('✅ ' + result.message);
                } else {
                    alert('❌ Error: ' + (result.message || 'No se pudo imprimir'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Error de conexión al intentar reimprimir');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
            return; // Detener propagación
        }

        if (e.target.classList.contains('btn-imprimir-nota')) {
            const idTicket = e.target.getAttribute('data-id');
            const btn = e.target;

            if (!confirm(`¿Imprimir Nota de Venta para Ticket #${idTicket}?`)) return;

            // Feedback visual simple
            const originalText = btn.textContent;
            btn.textContent = '...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/tickets/print-nota', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_ticket: idTicket })
                });

                const result = await res.json();

                if (res.ok) {
                    alert(result.message);
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error(error);
                alert('Error al solicitar impresiónn.');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    });

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