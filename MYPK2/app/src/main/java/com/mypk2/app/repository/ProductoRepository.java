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

    // NUEVOS MÉTODOS PARA ESTADÍSTICAS
    public int getTotalProductos() {
        return productos.size();
    }

    public int getProductosActivosCount() {
        int count = 0;
        for (Producto p : productos) {
            if (p.isActivo()) count++;
        }
        return count;
    }

    public int getProductosInactivosCount() {
        return productos.size() - getProductosActivosCount();
    }

    // Método para filtrar por categoría (mejorado)
    public List<Producto> getProductosPorCategoria(String categoria) {
        List<Producto> filtrados = new ArrayList<>();
        String categoriaLower = categoria.toLowerCase();

        for (Producto p : productos) {
            String nombreLower = p.getNombre().toLowerCase();

            if (categoriaLower.equals("entradas") && nombreLower.contains("entrada")) {
                filtrados.add(p);
            } else if (categoriaLower.equals("menus") && nombreLower.contains("menú")) {
                filtrados.add(p);
            } else if (categoriaLower.equals("bebidas") &&
                    (nombreLower.contains("jugo") || nombreLower.contains("chicha"))) {
                filtrados.add(p);
            } else if (categoriaLower.equals("platos") &&
                    !nombreLower.contains("entrada") &&
                    !nombreLower.contains("menú") &&
                    !nombreLower.contains("jugo") &&
                    !nombreLower.contains("chicha")) {
                filtrados.add(p);
            }
        }
        return filtrados;
    }

    // Método para buscar productos
    public List<Producto> buscarProductos(String query) {
        List<Producto> resultados = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>(productos);
        }

        String queryLower = query.toLowerCase().trim();
        for (Producto p : productos) {
            if (p.getNombre().toLowerCase().contains(queryLower)) {
                resultados.add(p);
            }
        }
        return resultados;
    }

    // Método para obtener productos ordenados por precio
    public List<Producto> getProductosOrdenadosPorPrecio(boolean ascendente) {
        List<Producto> ordenados = new ArrayList<>(productos);
        ordenados.sort((p1, p2) -> {
            if (ascendente) {
                return Double.compare(p1.getPrecio(), p2.getPrecio());
            } else {
                return Double.compare(p2.getPrecio(), p1.getPrecio());
            }
        });
        return ordenados;
    }

    // Método para obtener productos ordenados por nombre
    public List<Producto> getProductosOrdenadosPorNombre() {
        List<Producto> ordenados = new ArrayList<>(productos);
        ordenados.sort((p1, p2) -> p1.getNombre().compareToIgnoreCase(p2.getNombre()));
        return ordenados;
    }

    // Método para agregar nuevo producto (para futuras mejoras)
    public void agregarProducto(Producto producto) {
        productos.add(producto);
    }

    // Método para eliminar producto (para futuras mejoras)
    public boolean eliminarProducto(String nombre) {
        for (int i = 0; i < productos.size(); i++) {
            if (productos.get(i).getNombre().equals(nombre)) {
                productos.remove(i);
                return true;
            }
        }
        return false;
    }

    // Método para actualizar precio
    public boolean actualizarPrecio(String nombre, double nuevoPrecio) {
        for (Producto p : productos) {
            if (p.getNombre().equals(nombre)) {
                p.setPrecio(nuevoPrecio);
                return true;
            }
        }
        return false;
    }

    // Método para obtener producto por nombre
    public Producto getProductoPorNombre(String nombre) {
        for (Producto p : productos) {
            if (p.getNombre().equals(nombre)) {
                return p;
            }
        }
        return null;
    }
}