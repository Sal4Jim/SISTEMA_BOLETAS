document.addEventListener('DOMContentLoaded', () => {
    const listaProductosEl = document.getElementById('lista-productos');
    const carritoItemsEl = document.getElementById('carrito-items');
    const carritoTotalEl = document.getElementById('carrito-total');
    const btnGenerarBoleta = document.getElementById('btn-generar-boleta');

    let carrito = [];

    // 1. Cargar productos desde la API
    const fetchProductos = async () => {
        try {
            const response = await fetch('/api/productos');
            if (!response.ok) throw new Error('No se pudo obtener la lista de productos.');
            const productos = await response.json();
            renderProductos(productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            listaProductosEl.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    };

    // 2. Renderizar los productos en la página
    const renderProductos = (productos) => {
        listaProductosEl.innerHTML = '';
        productos.forEach(producto => {
            const productoEl = document.createElement('div');
            productoEl.className = 'producto-card';
            productoEl.innerHTML = `
                <div class="producto-info">
                    <h5>${producto.nombre}</h5>
                    <p>S/ ${Number(producto.precio).toFixed(2)}</p>
                    <div class="producto-accion">
                        <button class="btn-agregar" data-id="${producto.id_producto}">Agregar</button>
                    </div>
                </div>
            `;
            listaProductosEl.appendChild(productoEl);
        });
    };

    // 3. Lógica para agregar al carrito
    listaProductosEl.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-agregar')) {
            const productoId = e.target.dataset.id;
            
            // Obtener detalles completos del producto desde la API
            const response = await fetch(`/api/productos/${productoId}`);
            const producto = await response.json();

            const itemExistente = carrito.find(item => item.id_producto === producto.id_producto);

            if (itemExistente) {
                itemExistente.cantidad++;
            } else {
                carrito.push({ ...producto, cantidad: 1 });
            }
            renderCarrito();
        }
    });

    // 4. Renderizar el carrito de compras
    const renderCarrito = () => {
        carritoItemsEl.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            carritoItemsEl.innerHTML = '<li>El carrito está vacío</li>';
        } else {
            carrito.forEach(item => {
                const subtotal = item.cantidad * item.precio;
                total += subtotal;
                item.subtotal = subtotal; // Guardamos el subtotal para el ticket

                const li = document.createElement('li');                
                li.innerHTML = `
                    <span>${item.nombre} (x${item.cantidad})</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                `;
                carritoItemsEl.appendChild(li);
            });
        }
        carritoTotalEl.textContent = `Total: S/ ${total.toFixed(2)}`;
    };

    // 5. Generar la boleta
    btnGenerarBoleta.addEventListener('click', async () => {
        if (carrito.length === 0) {
            alert('El carrito está vacío. Agrega productos antes de generar una boleta.');
            return;
        }

        const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);

        const ventaData = {
            total_venta: totalVenta,
            productos: carrito
        };

        try {
            const response = await fetch('/api/boletas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ventaData)
            });

            const result = await response.json();

            if (response.ok || response.status === 207) { // 207: Multi-Status (éxito parcial)
                alert(result.message);
                carrito = []; // Limpiar carrito
                renderCarrito();
            } else {
                throw new Error(result.message || 'Error desconocido al generar la boleta.');
            }
        } catch (error) {
            console.error('Error al generar boleta:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Iniciar todo
    fetchProductos();
    renderCarrito();
});