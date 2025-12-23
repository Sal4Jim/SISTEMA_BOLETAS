package com.mypk2.app.repository;

import com.mypk2.app.model.Producto;
import java.util.ArrayList;
import java.util.List;

public class ProductoRepository {
    private static ProductoRepository instance;
    private List<Producto> productos;

    private ProductoRepository() {
        productos = new ArrayList<>();
        productos.add(new Producto("Ceviche Clásico", 28.0, true));
        productos.add(new Producto("Arroz con Mariscos", 32.0, true));
        productos.add(new Producto("Chicharrón de Pescado", 26.0, false));
        productos.add(new Producto("Jugo de Maracuyá", 8.0, true));
        productos.add(new Producto("Entrada: Palta Rellena", 12.0, true));
        productos.add(new Producto("Menú Playa: Ceviche + Bebida", 35.0, true));
        productos.add(new Producto("Menú Sunset: Arroz + Postre", 40.0, false));
        productos.add(new Producto("Helado de Coco", 6.0, true));
        productos.add(new Producto("Pescado a lo Macho", 36.0, true));
        productos.add(new Producto("Chicha Morada", 5.0, true));
    }

    public static synchronized ProductoRepository getInstance() {
        if (instance == null) {
            instance = new ProductoRepository();
        }
        return instance;
    }

    public List<Producto> getProductos() {
        return new ArrayList<>(productos);
    }

    public List<Producto> getProductosActivos() {
        List<Producto> activos = new ArrayList<>();
        for (Producto p : productos) {
            if (p.isActivo()) activos.add(p);
        }
        return activos;
    }

    public void actualizarActivo(String nombre, boolean activo) {
        for (Producto p : productos) {
            if (p.getNombre().equals(nombre)) {
                p.setActivo(activo);
                break;
            }
        }
    }

    public void resetCantidades() {
        for (Producto p : productos) {
            p.setCantidad(0);
        }
    }
}