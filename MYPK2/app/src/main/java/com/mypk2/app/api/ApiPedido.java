package com.mypk2.app.api;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ApiPedido {
    @SerializedName("mesa")
    private String mesa;

    @SerializedName("notas")
    private String notas;

    @SerializedName("total_estimado")
    private double totalEstimado;

    @SerializedName("productos")
    private List<ProductoPedido> productos;

    public ApiPedido(String mesa, String notas, double totalEstimado, List<ProductoPedido> productos) {
        this.mesa = mesa;
        this.notas = notas;
        this.totalEstimado = totalEstimado;
        this.productos = productos;
    }

    public String getMesa() { return mesa; }
    public String getNotas() { return notas; }
    public double getTotalEstimado() { return totalEstimado; }
    public List<ProductoPedido> getProductos() { return productos; }

    public static class ProductoPedido {
        @SerializedName("id_producto")
        private int idProducto;

        @SerializedName("cantidad")
        private int cantidad;

        public ProductoPedido(int idProducto, int cantidad) {
            this.idProducto = idProducto;
            this.cantidad = cantidad;
        }

        public int getIdProducto() { return idProducto; }
        public int getCantidad() { return cantidad; }
    }
}