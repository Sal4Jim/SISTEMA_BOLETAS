document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const listaProductosEl = document.getElementById('lista-productos');
    const carritoItemsEl = document.getElementById('carrito-items');
    const carritoTotalEl = document.getElementById('carrito-total');
    const btnEnviarCocina = document.getElementById('btn-enviar-cocina');
    const mesaInput = document.getElementById('mesa');
    const notasInput = document.getElementById('notas');
    const searchInput = document.getElementById('searchProduct');
    const categoryTabsEl = document.getElementById('categoryTabs');

    // Estado
    let carrito = [];
    let productosGlobal = [];
    let categoriasGlobal = [];
    let categoriaActiva = 'all';

    // 1. Cargar Datos Iniciales (Productos y Categorías)
    const initData = async () => {
        try {
            // Cargar Productos
            const resProd = await fetch('/api/productos');
            if (!resProd.ok) throw new Error('Error cargando productos');
            const dataProd = await resProd.json();
            // Asegurar que sea array (por si la API devuelve {data: [...]})
            productosGlobal = Array.isArray(dataProd) ? dataProd : (dataProd.data || []);

            // Cargar Categorías
            const resCat = await fetch('/api/categorias');
            if (!resCat.ok) throw new Error('Error cargando categorías');
            const dataCat = await resCat.json();
            categoriasGlobal = Array.isArray(dataCat) ? dataCat : (dataCat.data || []);

            renderCategorias();
            renderProductos(productosGlobal); // pass data!
        } catch (error) {
            console.error(error);
            listaProductosEl.innerHTML = `<p class="text-error">Error de conexión: ${error.message}</p>`;
        }
    };

    // 2. Renderizar Pestañas de Categoría
    const renderCategorias = () => {
        // Limpiar tabs excepto el primero "Todos"
        const allTab = categoryTabsEl.querySelector('[data-id="all"]');
        categoryTabsEl.innerHTML = '';
        categoryTabsEl.appendChild(allTab);

        categoriasGlobal.forEach(cat => {
            if (!cat.activo) return;
            const btn = document.createElement('button');
            btn.className = 'cat-tab';
            btn.textContent = cat.nombre;
            btn.dataset.id = cat.id_categoria;
            btn.onclick = () => setCategoria(cat.id_categoria, btn);
            categoryTabsEl.appendChild(btn);
        });

        // Configurar click en "Todos"
        allTab.onclick = () => setCategoria('all', allTab);
    };

    const setCategoria = (id, btnElement) => {
        categoriaActiva = id;
        
        // Actualizar UI tabs
        document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');

        // Filtrar productos
        filtrarYRenderizar();
    };

    // 3. Filtrar y Renderizar Productos
    const filtrarYRenderizar = () => {
        const busqueda = searchInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const filtrados = productosGlobal.filter(p => {
            const matchCategoria = categoriaActiva === 'all' || p.id_categoria == categoriaActiva;
            const nombreNorm = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const matchBusqueda = nombreNorm.includes(busqueda);
            
            return matchCategoria && matchBusqueda && p.activo;
        });

        renderProductos(filtrados);
    };

    const renderProductos = (lista) => {
        listaProductosEl.innerHTML = '';
        if (lista.length === 0) {
            listaProductosEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#999; padding:20px;">No se encontraron productos</div>';
            return;
        }

        lista.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Imagen o Placeholder
            let imgHtml = `<div class="card-img-container"><span class="card-placeholder">🍽️</span></div>`;
            if (p.imagen) {
                 imgHtml = `<div class="card-img-container"><img src="${p.imagen}" alt="${p.nombre}" class="card-img" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\'card-placeholder\'>🍽️</span>'"></div>`;
            }

            card.innerHTML = `
                ${imgHtml}
                <div class="card-info">
                    <h5>${p.nombre}</h5>
                    <span class="price">S/ ${Number(p.precio).toFixed(2)}</span>
                </div>
            `;
            card.onclick = () => agregarAlCarrito(p);
            listaProductosEl.appendChild(card);
        });
    };

    // 4. Lógica del Carrito (Comanda)
    const agregarAlCarrito = (producto) => {
        const existente = carrito.find(item => item.id_producto === producto.id_producto);
        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        renderCarrito();
    };

    const cambiarCantidad = (index, delta) => {
        const item = carrito[index];
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant > 0) {
            item.cantidad = nuevaCant;
        } else {
            // Eliminar si baja a 0? O dejar en 1? Dejamos en 1, para borrar usar el botón X
            // Alternativa: eliminar si es 0
            // carrito.splice(index, 1);
        }
        renderCarrito();
    };

    const eliminarDelCarrito = (index) => {
        carrito.splice(index, 1);
        renderCarrito();
    };

    const renderCarrito = () => {
        carritoItemsEl.innerHTML = '';
        
        let itemsParaCalculo = carrito.map(item => ({...item, precioCalculado: Number(item.precio)}));
        
        // 2. Aplicar Regla Menú (ID 1) + Entrada (ID 4) = 12.00
        const ID_CAT_MENU = 1;
        const ID_CAT_ENTRADA = 4;

        const menus = itemsParaCalculo.filter(i => i.id_categoria === ID_CAT_MENU);
        const entradas = itemsParaCalculo.filter(i => i.id_categoria === ID_CAT_ENTRADA);
        
        // Expandir items por cantidad para emparejar uno a uno lógica simple
        let listaMenus = [];
        let listaEntradas = [];

        menus.forEach(m => {
            for(let k=0; k<m.cantidad; k++) listaMenus.push(m);
        });
        entradas.forEach(e => {
            for(let k=0; k<e.cantidad; k++) listaEntradas.push(e);
        });

        let total = 0;
        let pairedCount = 0;
        const paresPosibles = Math.min(listaMenus.length, listaEntradas.length);

        // Sumar todo el carrito inicialmente con precios normales
        // Pero es más fácil recalcular:
        
        // Resto de items (no menu ni entrada)
        const otros = itemsParaCalculo.filter(i => i.id_categoria !== ID_CAT_MENU && i.id_categoria !== ID_CAT_ENTRADA);
        otros.forEach(o => total += (o.precioCalculado * o.cantidad));

        // Calcular pares
        for(let i=0; i < paresPosibles; i++) {
             // 1 Menu + 1 Entrada = 12.00
             total += 12.00;
        }

        // Calcular sobrantes
        const menusSobrantes = listaMenus.length - paresPosibles;
        const entradasSobrantes = listaEntradas.length - paresPosibles;

        if(menusSobrantes > 0) {
        }
 
        
        let totalBase = 0;
        carrito.forEach(i => totalBase += (i.cantidad * Number(i.precio)));

        const totalMenusQty = carrito.reduce((sum, i) => i.id_categoria === ID_CAT_MENU ? sum + i.cantidad : sum, 0);
        const totalEntradasQty = carrito.reduce((sum, i) => i.id_categoria === ID_CAT_ENTRADA ? sum + i.cantidad : sum, 0);
        const pares = Math.min(totalMenusQty, totalEntradasQty);
        
        let descuentoTotal = 0;
        
        // Aplanar para emparejar
        let flatMenus = [];
        carrito.filter(i => i.id_categoria === ID_CAT_MENU).forEach(i => {
            for(let k=0; k<i.cantidad; k++) flatMenus.push(Number(i.precio));
        });
        let flatEntradas = [];
        carrito.filter(i => i.id_categoria === ID_CAT_ENTRADA).forEach(i => {
            for(let k=0; k<i.cantidad; k++) flatEntradas.push(Number(i.precio));
        });

        for(let i=0; i<pares; i++) {
            const pMenu = flatMenus[i];
            const pEntrada = flatEntradas[i];
            const sumaReal = pMenu + pEntrada;
            if(sumaReal > 12.00) {
                descuentoTotal += (sumaReal - 12.00);
            }
        }
        
        const totalConDescuento = totalBase - descuentoTotal;


        if (carrito.length === 0) {
            carritoItemsEl.innerHTML = '<li style="text-align:center; color:#999; padding:20px;">Selecciona productos para comenzar</li>';
            carritoTotalEl.textContent = 'S/ 0.00';
            return;
        }

        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.nombre}</span>
                    <span style="font-size:0.85rem; color:#666;">S/ ${Number(item.precio).toFixed(2)} c/u</span>
                </div>
                <div class="cart-item-qty">
                    <button class="btn-qty" onclick="changeQty(${index}, -1)">-</button>
                    <span style="font-weight:600; min-width:20px; text-align:center;">${item.cantidad}</span>
                    <button class="btn-qty" onclick="changeQty(${index}, 1)">+</button>
                </div>
                <div style="margin-left:15px; text-align:right;">
                    <div style="font-weight:600;">S/ ${subtotal.toFixed(2)}</div>
                    <button class="btn-remove" onclick="removeItem(${index})">Eliminar</button>
                </div>
            `;
            carritoItemsEl.appendChild(li);
        });
        
        // Agregar linea de descuento si aplica
        if(descuentoTotal > 0) {
             const liDesc = document.createElement('li');
             liDesc.className = 'cart-item';
             liDesc.style.backgroundColor = '#e8f5e9';
             liDesc.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-title" style="color: #2ecc71;">✨ Descuento Combo (Menú+Entrada=12)</span>
                </div>
                <div style="font-weight:600; color: #2ecc71;">- S/ ${descuentoTotal.toFixed(2)}</div>
             `;
             carritoItemsEl.appendChild(liDesc);
        }

        carritoTotalEl.textContent = `S/ ${totalConDescuento.toFixed(2)}`;
    };

    // Exponer funciones globales para el HTML generado
    window.changeQty = (idx, delta) => cambiarCantidad(idx, delta);
    window.removeItem = (idx) => eliminarDelCarrito(idx);

    // 5. Enviar Comanda (Ticket)
    btnEnviarCocina.addEventListener('click', async () => {
        if (carrito.length === 0) return alert('La comanda está vacía');
        
        const mesa = mesaInput.value;
        if (!mesa) return alert('Por favor seleccione una Mesa');

        const notas = notasInput.value;
        const totalEstimado = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);

        // Preparar payload para API Tickets
        const ticketData = {
            mesa: mesa,
            notas: notas,
            total_estimado: totalEstimado,
            productos: carrito.map(p => ({
                id_producto: p.id_producto,
                cantidad: p.cantidad,
                // Opcional: enviar precio unitario si queremos congelarlo, el backend lo maneja
            }))
        };

        const originalText = btnEnviarCocina.innerHTML;
        btnEnviarCocina.disabled = true;
        btnEnviarCocina.innerHTML = '⏳ Enviando...';

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ Comanda enviada a cocina (Ticket #${data.ticket.id_ticket})`);
                // Reset
                carrito = [];
                mesaInput.value = '';
                notasInput.value = '';
                renderCarrito();
            } else {
                alert('❌ Error: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('❌ Error de conexión');
        } finally {
            btnEnviarCocina.disabled = false;
            btnEnviarCocina.innerHTML = originalText;
        }
    });

    // Evento búsqueda
    searchInput.addEventListener('input', filtrarYRenderizar);

    // Iniciar
    initData();
});