package com.mypk2.app.api;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Body;
import retrofit2.http.Query;

public interface ApiService {
    // Obtener todos los productos
    @GET("productos")
    Call<ProductoResponse> getProductos();

    // Obtener productos activos (para menú)
    @GET("productos")
    Call<ProductoResponse> getProductosActivos(@Query("activo") int activo);

    // Obtener productos por categoría
    @GET("productos")
    Call<ProductoResponse> getProductosPorCategoria(@Query("categoria") int idCategoria);

    // Obtener todas las categorías
    @GET("categorias")
    Call<CategoriaResponse> getCategorias();

    // Obtener categorías activas
    @GET("categorias")
    Call<CategoriaResponse> getCategoriasActivas(@Query("activo") int activo);

    // Obtener productos filtrados por categorías (comma separated)
    @GET("productos")
    Call<ProductoResponse> getProductosFiltrados(@Query("categorias") String categorias,
            @Query("activo") Object activo);

    // Actualizar estado activo de un producto
    @retrofit2.http.PUT("productos/{id}/activo")
    Call<com.google.gson.JsonObject> updateProductoActivo(@retrofit2.http.Path("id") int id,
            @Body com.google.gson.JsonObject body);

    // Enviar pedido (ticket)
    @POST("pedidos")
    Call<ApiResponse> enviarPedido(@Body ApiPedido pedido);
}