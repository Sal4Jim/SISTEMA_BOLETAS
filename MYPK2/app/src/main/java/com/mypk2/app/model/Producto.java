package com.mypk2.app.model;

import com.google.gson.annotations.SerializedName;

public class Producto {
    @SerializedName("id_producto")
    private int id;

    @SerializedName("nombre")
    private String nombre;

    @SerializedName("descripcion")
    private String descripcion;

    @SerializedName("precio")
    private double precio;

    @SerializedName("imagen")
    private String imagen;

    @SerializedName("activo")
    private boolean activo;

    @SerializedName("id_categoria")
    private int idCategoria;

    @SerializedName("categoria_nombre")
    private String categoriaNombre;

    private int cantidad; // Solo para la app, no viene de la API
    private int imagenResId; // Para imágenes locales

    public Producto() {
        // Constructor vacío para Gson
    }

    // Getters y Setters (genera con Alt+Insert en Android Studio)
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public int getIdCategoria() { return idCategoria; }
    public void setIdCategoria(int idCategoria) { this.idCategoria = idCategoria; }

    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }

    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    public int getImagenResId() { return imagenResId; }
    public void setImagenResId(int imagenResId) { this.imagenResId = imagenResId; }

    @Override
    public String toString() {
        return nombre + " - S/. " + precio;
    }
}