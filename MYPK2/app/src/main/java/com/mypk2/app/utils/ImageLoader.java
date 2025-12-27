package com.mypk2.app.utils;

import android.content.Context;
import android.widget.ImageView;
import androidx.annotation.DrawableRes;
import com.mypk2.app.R;
import com.mypk2.app.model.Producto;
import java.util.HashMap;
import java.util.Map;

public class ImageLoader {

    // Mapeo de nombres de productos a recursos de imagen
    private static final Map<String, Integer> IMAGENES_POR_PRODUCTO = new HashMap<>();

    static {
        // Inicializar el mapeo (opcional, para futuras imágenes específicas)
        IMAGENES_POR_PRODUCTO.put("Ceviche Clásico", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Arroz con Mariscos", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Chicharrón de Pescado", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Jugo de Maracuyá", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Entrada: Palta Rellena", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Menú Playa: Ceviche + Bebida", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Menú Sunset: Arroz + Postre", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Helado de Coco", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Pescado a lo Macho", R.drawable.placeholder_comida);
        IMAGENES_POR_PRODUCTO.put("Chicha Morada", R.drawable.placeholder_comida);
    }

    public static void cargarImagenProducto(Context context, ImageView imageView, Producto producto) {
        // Verificar si tiene imagen local
        if (producto.getImagenResId() != 0) {
            cargarImagenLocal(context, imageView, producto.getImagenResId());
        } else {
            // Usar mapeo por nombre o placeholder genérico
            Integer resId = IMAGENES_POR_PRODUCTO.get(producto.getNombre());
            if (resId != null) {
                cargarImagenLocal(context, imageView, resId);
            } else {
                cargarImagenLocal(context, imageView, R.drawable.placeholder_comida);
            }
        }
    }

    private static void cargarImagenLocal(Context context, ImageView imageView, @DrawableRes int resId) {
        if (resId != 0) {
            imageView.setImageResource(resId);
        } else {
            imageView.setImageResource(R.drawable.placeholder_comida);
        }
    }

    // Método simple para compatibilidad
    public static void cargarImagenPorNombre(Context context, ImageView imageView, String nombreImagen) {
        if (nombreImagen != null && !nombreImagen.isEmpty()) {
            int resourceId = context.getResources().getIdentifier(
                    nombreImagen, "drawable", context.getPackageName()
            );

            if (resourceId != 0) {
                imageView.setImageResource(resourceId);
            } else {
                imageView.setImageResource(R.drawable.placeholder_comida);
            }
        } else {
            imageView.setImageResource(R.drawable.placeholder_comida);
        }
    }
} 