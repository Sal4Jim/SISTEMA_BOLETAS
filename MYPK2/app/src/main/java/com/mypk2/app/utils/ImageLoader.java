package com.mypk2.app.utils;

import android.content.Context;
import android.widget.ImageView;
import androidx.annotation.DrawableRes;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.mypk2.app.R;
import com.mypk2.app.api.RetrofitClient;
import com.mypk2.app.model.Producto;

public class ImageLoader {

    public static void cargarImagenProducto(Context context, ImageView imageView, Producto producto) {
        // 1. Prioridad: Imagen URL desde base de datos
        if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
            String urlCompleta = RetrofitClient.SERVER_URL + producto.getImagen();

            // Corregir duplicidad de slashes si ocurre (ej: http://...//images...)
            // Aunque SERVER_URL no tiene slash final y producto.getImagen() debe empezar
            // con /.
            // Para seguridad, si imagen no tiene /, agregarla.
            if (!producto.getImagen().startsWith("/")) {
                urlCompleta = RetrofitClient.SERVER_URL + "/" + producto.getImagen();
            }

            Glide.with(context)
                    .load(urlCompleta)
                    .placeholder(R.drawable.placeholder_comida)
                    .error(R.drawable.placeholder_comida)
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .centerCrop()
                    .into(imageView);

            return;
        }

        // 2. Fallback: Recurso Local (ID) si existe
        if (producto.getImagenResId() != 0) {
            cargarImagenLocal(context, imageView, producto.getImagenResId());
            return;
        }

        // 3. Fallback: Placeholder por defecto
        cargarImagenLocal(context, imageView, R.drawable.placeholder_comida);
    }

    private static void cargarImagenLocal(Context context, ImageView imageView, @DrawableRes int resId) {
        Glide.with(context)
                .load(resId != 0 ? resId : R.drawable.placeholder_comida)
                .centerCrop()
                .into(imageView);
    }

    // Método simple para compatibilidad
    public static void cargarImagenPorNombre(Context context, ImageView imageView, String nombreImagen) {
        // Implementación con Glide si fuera necesaria, pero por ahora mantenemos
        // compatibilidad básica o placeholder
        Glide.with(context)
                .load(R.drawable.placeholder_comida)
                .centerCrop()
                .into(imageView);
    }
}