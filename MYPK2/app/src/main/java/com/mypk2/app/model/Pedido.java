package com.mypk2.app.model;

import java.util.List;

public class Pedido {
    private String tipo; // "Mesa" o "Delivery"
    private String ubicacion; // Número de mesa o dirección
    private List<Producto> productos;
    private int cantidadTapers;
    private String observaciones;
    private double total;
    private String fecha;
    private String estado; // "PENDIENTE", "PREPARANDO", "ENTREGADO"

    // Constructores
    public Pedido() {
    }

    public Pedido(String tipo, String ubicacion, List<Producto> productos,
                  int cantidadTapers, String observaciones, double total,
                  String fecha, String estado) {
        this.tipo = tipo;
        this.ubicacion = ubicacion;
        this.productos = productos;
        this.cantidadTapers = cantidadTapers;
        this.observaciones = observaciones;
        this.total = total;
        this.fecha = fecha;
        this.estado = estado;
    }

    // Getters y Setters
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public List<Producto> getProductos() { return productos; }
    public void setProductos(List<Producto> productos) { this.productos = productos; }

    public int getCantidadTapers() { return cantidadTapers; }
    public void setCantidadTapers(int cantidadTapers) { this.cantidadTapers = cantidadTapers; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    @Override
    public String toString() {
        return "Pedido{" +
                "tipo='" + tipo + '\'' +
                ", ubicacion='" + ubicacion + '\'' +
                ", productos=" + productos.size() +
                ", tapers=" + cantidadTapers +
                ", total=" + total +
                ", fecha='" + fecha + '\'' +
                ", estado='" + estado + '\'' +
                '}';
    }
}