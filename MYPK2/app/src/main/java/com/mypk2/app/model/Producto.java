package com.mypk2.app.model;

public class Producto {
    private String nombre;
    private double precio;
    private int cantidad;
    private boolean activo;

    public Producto(String nombre, double precio, boolean activo) {
        this.nombre = nombre;
        this.precio = precio;
        this.activo = activo;
        this.cantidad = 0;
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    @Override
    public String toString() {
        return nombre + " (" + (activo ? "✔" : "✖") + ")";
    }
}