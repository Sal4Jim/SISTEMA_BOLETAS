package com.mypk2.app.repository;

import android.content.Context;
import android.widget.Toast;
import androidx.lifecycle.MutableLiveData;
import com.mypk2.app.api.ApiService;
import com.mypk2.app.api.CategoriaResponse;
import com.mypk2.app.api.ProductoResponse;
import com.mypk2.app.api.RetrofitClient;
import com.mypk2.app.model.Categoria;
import com.mypk2.app.model.Producto;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProductoRepository {
    private static ProductoRepository instance;
    private List<Producto> productos = new ArrayList<>();
    private List<Categoria> categorias = new ArrayList<>();
    private Map<Integer, Producto> productosMap = new HashMap<>();
    private Map<Integer, Categoria> categoriasMap = new HashMap<>();
    private Map<Integer, Producto> carrito = new HashMap<>(); // Carrito global con objetos completos
    private MutableLiveData<List<Producto>> productosLiveData = new MutableLiveData<>();
    private MutableLiveData<List<Categoria>> categoriasLiveData = new MutableLiveData<>();
    private int cantidadTapers = 0;
    private Context context;

    private ProductoRepository(Context context) {
        this.context = context.getApplicationContext();
        productosLiveData.setValue(new ArrayList<>());
        categoriasLiveData.setValue(new ArrayList<>());
    }

    public static synchronized ProductoRepository getInstance(Context context) {
        if (instance == null) {
            instance = new ProductoRepository(context);
        }
        return instance;
    }

    // ========== MÉTODOS PARA PRODUCTOS ==========

    public void cargarProductosDesdeAPI(String categoriasFilter, boolean soloActivos) {
        if (!RetrofitClient.isNetworkAvailable(context)) {
            mostrarToast("Sin conexión a internet");
            productosLiveData.postValue(new ArrayList<>());
            return;
        }

        ApiService apiService = RetrofitClient.getApiService();
        Call<ProductoResponse> call;

        // Si hay filtro de categorías
        if (categoriasFilter != null && !categoriasFilter.isEmpty()) {
            call = apiService.getProductosFiltrados(categoriasFilter, soloActivos ? 1 : null);
        } else {
            if (soloActivos) {
                call = apiService.getProductosActivos(1); // 1 = activo
            } else {
                call = apiService.getProductos(); // todos
            }
        }

        call.enqueue(new Callback<ProductoResponse>() {
            @Override
            public void onResponse(Call<ProductoResponse> call, Response<ProductoResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ProductoResponse productoResponse = response.body();
                    if (productoResponse.isSuccess()) {
                        // Nota: No limpiamos 'carrito', solo la lista visible 'productos'
                        productos.clear();
                        productosMap.clear();

                        for (Producto producto : productoResponse.getProductos()) {
                            // Sincronizar con el carrito global
                            if (carrito.containsKey(producto.getId())) {
                                Producto enCarrito = carrito.get(producto.getId());
                                producto.setCantidad(enCarrito.getCantidad());
                                // Actualizamos la referencia en el carrito para tener los datos más recientes
                                // (precio, etc)
                                carrito.put(producto.getId(), producto);
                            }

                            // Excluir Taper (ID 6) de la lista principal ya que se maneja aparte
                            if (producto.getId() == 6) {
                                continue;
                            }

                            productos.add(producto);
                            productosMap.put(producto.getId(), producto);
                        }

                        productosLiveData.postValue(new ArrayList<>(productos));
                        // mostrarToast("Productos cargados: " + productos.size()); // Comentado para no
                        // spammear
                    } else {
                        mostrarToast("Error: " + productoResponse.getMessage());
                        productosLiveData.postValue(new ArrayList<>());
                    }
                } else {
                    mostrarToast("Error del servidor: " + response.code());
                    productosLiveData.postValue(new ArrayList<>());
                }
            }

            @Override
            public void onFailure(Call<ProductoResponse> call, Throwable t) {
                mostrarToast("Error de conexión: " + t.getMessage());
                productosLiveData.postValue(new ArrayList<>());
            }
        });
    }

    // Sobrecarga para mantener compatibilidad con código antiguo
    public void cargarProductosDesdeAPI(boolean soloActivos) {
        cargarProductosDesdeAPI(null, soloActivos);
    }

    // Sobrecarga para filtro sin especificar activo (por defecto false)
    public void cargarProductosDesdeAPI(String categoriasFilter) {
        cargarProductosDesdeAPI(categoriasFilter, false);
    }

    // Método para mantener el carrito actualizado desde el Adapter
    public void actualizarProductoCarrito(Producto producto) {
        if (producto.getCantidad() > 0) {
            carrito.put(producto.getId(), producto);
        } else {
            carrito.remove(producto.getId());
        }
    }

    // Método para actualizar estado activo real en API
    public void actualizarActivo(int idProducto, boolean activo) {
        // Encontrar producto localmente primero
        Producto productoEncontrado = null;
        for (Producto p : productos) {
            if (p.getId() == idProducto) {
                productoEncontrado = p;
                break;
            }
        }

        if (productoEncontrado == null)
            return;

        // Actualizar localmente para respuesta inmediata en UI
        productoEncontrado.setActivo(activo);
        productosLiveData.postValue(new ArrayList<>(productos));

        // Llamada a la API
        ApiService apiService = RetrofitClient.getApiService();
        com.google.gson.JsonObject body = new com.google.gson.JsonObject();
        body.addProperty("activo", activo);

        apiService.updateProductoActivo(productoEncontrado.getId(), body)
                .enqueue(new Callback<com.google.gson.JsonObject>() {
                    @Override
                    public void onResponse(Call<com.google.gson.JsonObject> call,
                            Response<com.google.gson.JsonObject> response) {
                        if (response.isSuccessful()) {
                            mostrarToast(activo ? "Activado correctamente" : "Desactivado correctamente");
                        } else {
                            mostrarToast("Error al actualizar estado en servidor");
                            // Revertir cambio local si falla
                            // productoEncontrado.setActivo(!activo);
                            // productosLiveData.postValue(new ArrayList<>(productos));
                        }
                    }

                    @Override
                    public void onFailure(Call<com.google.gson.JsonObject> call, Throwable t) {
                        mostrarToast("Fallo de red al actualizar estado");
                    }
                });
    }

    // ========== MÉTODOS PARA CATEGORÍAS ==========

    public void cargarCategoriasDesdeAPI(boolean soloActivas) {
        if (!RetrofitClient.isNetworkAvailable(context)) {
            mostrarToast("Sin conexión a internet");
            categoriasLiveData.postValue(new ArrayList<>());
            return;
        }

        ApiService apiService = RetrofitClient.getApiService();
        Call<CategoriaResponse> call;

        if (soloActivas) {
            call = apiService.getCategoriasActivas(1); // 1 = activo
        } else {
            call = apiService.getCategorias(); // todos
        }

        call.enqueue(new Callback<CategoriaResponse>() {
            @Override
            public void onResponse(Call<CategoriaResponse> call, Response<CategoriaResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    CategoriaResponse categoriaResponse = response.body();
                    if (categoriaResponse.isSuccess()) {
                        categorias.clear();
                        categoriasMap.clear();

                        for (Categoria categoria : categoriaResponse.getCategorias()) {
                            categorias.add(categoria);
                            categoriasMap.put(categoria.getId(), categoria);
                        }

                        categoriasLiveData.postValue(new ArrayList<>(categorias));
                    } else {
                        mostrarToast("Error: " + categoriaResponse.getMessage());
                        categoriasLiveData.postValue(new ArrayList<>());
                    }
                } else {
                    mostrarToast("Error del servidor: " + response.code());
                    categoriasLiveData.postValue(new ArrayList<>());
                }
            }

            @Override
            public void onFailure(Call<CategoriaResponse> call, Throwable t) {
                mostrarToast("Error de conexión: " + t.getMessage());
                categoriasLiveData.postValue(new ArrayList<>());
            }
        });
    }

    private void mostrarToast(String mensaje) {
        Toast.makeText(context, mensaje, Toast.LENGTH_SHORT).show();
    }

    // ========== GETTERS ==========

    public List<Producto> getProductos() {
        return new ArrayList<>(productos);
    }

    public List<Producto> getProductosActivos() {
        List<Producto> activos = new ArrayList<>();
        for (Producto p : productos) {
            if (p.isActivo()) {
                activos.add(p);
            }
        }
        return activos;
    }

    public List<Producto> getProductosCarrito() {
        return new ArrayList<>(carrito.values());
    }

    public int getCantidadTotalItems() {
        int total = 0;
        for (Producto p : carrito.values()) {
            total += p.getCantidad();
        }
        return total;
    }

    public List<Categoria> getCategorias() {
        return new ArrayList<>(categorias);
    }

    public List<Categoria> getCategoriasActivas() {
        List<Categoria> activas = new ArrayList<>();
        for (Categoria c : categorias) {
            if (c.isActivo()) {
                activas.add(c);
            }
        }
        return activas;
    }

    public Producto getProductoById(int id) {
        return productosMap.get(id);
    }

    public Categoria getCategoriaById(int id) {
        return categoriasMap.get(id);
    }

    public MutableLiveData<List<Producto>> getProductosLiveData() {
        return productosLiveData;
    }

    public MutableLiveData<List<Categoria>> getCategoriasLiveData() {
        return categoriasLiveData;
    }

    public void resetCantidades() {
        // Primero aseguramos que los objetos que están en el carrito queden en 0,
        // esto es crucial si hay refererencias en otras activities.
        for (Producto p : carrito.values()) {
            p.setCantidad(0);
        }
        carrito.clear(); // Limpiar persistencia global
        cantidadTapers = 0; // Resetear tapers

        // También limpiamos la lista actual por seguridad
        for (Producto p : productos) {
            p.setCantidad(0);
        }
        productosLiveData.postValue(new ArrayList<>(productos));
    }

    public int getTotalProductos() {
        return productos.size();
    }

    public int getProductosActivosCount() {
        int count = 0;
        for (Producto p : productos) {
            if (p.isActivo())
                count++;
        }
        return count;
    }

    public int getProductosInactivosCount() {
        int count = 0;
        for (Producto p : productos) {
            if (!p.isActivo())
                count++;
        }
        return count;
    }

    public int getCantidadTapers() {
        return cantidadTapers;
    }

    public void setCantidadTapers(int cantidadTapers) {
        this.cantidadTapers = cantidadTapers;
    }
}