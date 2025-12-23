document.addEventListener('DOMContentLoaded', () => {
    const tablaBody = document.getElementById('tabla-productos-body');
    const modal = document.getElementById('modal-producto');
    const btnNuevo = document.getElementById('btn-nuevo-producto');
    const spanClose = document.querySelector('.close-modal');
    const formProducto = document.getElementById('form-producto');
    const modalTitulo = document.getElementById('modal-titulo');
    const inputBusqueda = document.getElementById('input-busqueda');

    // Inputs del formulario
    const inputId = document.getElementById('prod-id');
    const inputNombre = document.getElementById('prod-nombre');
    const inputDescripcion = document.getElementById('prod-descripcion');
    const inputPrecio = document.getElementById('prod-precio');
    const inputImagen = document.getElementById('prod-imagen');
    const inputCategoria = document.getElementById('prod-categoria');

    let productosLista = [];

    // 0. Cargar Categorías para el Select
    const cargarCategorias = async () => {
        try {
            const res = await fetch('/api/categorias');
            const categorias = await res.json();
            
            inputCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nombre;
                inputCategoria.appendChild(option);
            });
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    };

    // Función auxiliar para renderizar la tabla
    const renderizarTabla = (lista) => {
        tablaBody.innerHTML = '';
        lista.forEach(prod => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${prod.id_producto}</td>
                    <td>
                        ${prod.imagen ? `<img src="${prod.imagen}" alt="Img" style="height: 50px; width: 50px; object-fit: cover; border-radius: 5px;">` : '<span style="color: #ccc;">Sin imagen</span>'}
                    </td>
                    <td>${prod.nombre}</td>
                    <td>${prod.descripcion || ''}</td>
                    <td>S/ ${Number(prod.precio).toFixed(2)}</td>
                    <td>${prod.nombre_categoria || 'Sin categoría'}</td>
                    <td>
                        <button class="btn-editar" data-id="${prod.id_producto}">Editar</button>
                        <button class="btn-eliminar" data-id="${prod.id_producto}">Eliminar</button>
                    </td>
                `;
                tablaBody.appendChild(tr);
            });
    };

    // 1. Cargar Productos
    const cargarProductos = async () => {
        try {
            const res = await fetch('/api/productos');
            productosLista = await res.json();
            renderizarTabla(productosLista);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    };

    // 2. Manejo del Modal
    btnNuevo.onclick = () => {
        formProducto.reset();
        inputId.value = '';
        modalTitulo.textContent = 'Nuevo Producto';
        modal.style.display = 'block';
    };

    spanClose.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // 3. Guardar (Crear o Editar)
    formProducto.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nombre', inputNombre.value);
        formData.append('descripcion', inputDescripcion.value);
        formData.append('precio', inputPrecio.value);
        formData.append('id_categoria', inputCategoria.value);

        if (inputImagen.files[0]) {
            formData.append('imagen', inputImagen.files[0]);
        }

        const id = inputId.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/productos/${id}` : '/api/productos';

        try {
            const res = await fetch(url, {
                method: method,
                body: formData // No establecer Content-Type manualmente con FormData
            });

            if (res.ok) {
                modal.style.display = 'none';
                cargarProductos();
            } else {
                alert('Error al guardar el producto');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 4. Botones de la tabla (Delegación de eventos)
    tablaBody.addEventListener('click', async (e) => {
        // Editar
        if (e.target.classList.contains('btn-editar')) {
            const id = e.target.dataset.id;
            const res = await fetch(`/api/productos/${id}`);
            const prod = await res.json();

            inputId.value = prod.id_producto;
            inputNombre.value = prod.nombre;
            inputDescripcion.value = prod.descripcion || '';
            inputPrecio.value = prod.precio;
            inputImagen.value = ''; // Limpiar input file (no se puede setear valor programáticamente)
            inputCategoria.value = prod.id_categoria;
            
            modalTitulo.textContent = 'Editar Producto';
            modal.style.display = 'block';
        }

        // Eliminar
        if (e.target.classList.contains('btn-eliminar')) {
            if (confirm('¿Estás seguro de eliminar este producto?')) {
                const id = e.target.dataset.id;
                const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
                
                if (res.ok) {
                    cargarProductos();
                } else {
                    const errorData = await res.json();
                    alert('Error al eliminar: ' + (errorData.message || 'El producto podría estar en uso en una boleta.'));
                }
            }
        }
    });

    // Inicializar
    cargarCategorias();
    cargarProductos();

    // Buscador en tiempo real
    inputBusqueda.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        const filtrados = productosLista.filter(prod => 
            prod.nombre.toLowerCase().includes(termino)
        );
        renderizarTabla(filtrados);
    });
});