package com.mypk2.app.utils;

import android.content.Context;
import android.widget.ImageView;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.mypk2.app.R;
import com.mypk2.app.api.RetrofitClient;
import com.mypk2.app.model.Producto;

public class ImageHelper {

    public static void cargarImagenProducto(Context context, ImageView imageView, Producto producto) {
        if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
            // Construir URL completa
            // RetrofitClient.BASE_URL es http://IP:3000/api/mobile/
            // Queremos: http://IP:3000/images/productos/...

            String baseUrl = RetrofitClient.BASE_URL.replace("api/mobile/", "");
            String fullUrl = baseUrl
                    + (producto.getImagen().startsWith("/") ? producto.getImagen().substring(1) : producto.getImagen());

            Glide.with(context)
                    .load(fullUrl)
                    .placeholder(R.drawable.placeholder_comida)
                    .error(R.drawable.placeholder_comida)
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .into(imageView);
        } else {
            // Si no hay imagen, cargar placeholder o lógica antigua por nombre
            cargarImagenPorDefecto(imageView, producto.getNombre());
        }
    }

    private static void cargarImagenPorDefecto(ImageView imageView, String nombreProducto) {
        @androidx.annotation.DrawableRes
        int resourceId;

        switch (nombreProducto.toLowerCase()) {
            case "ceviche clásico":
                resourceId = R.drawable.ceviche;
                break;
            case "arroz con mariscos":
                resourceId = R.drawable.arroz_mariscos;
                break;
            case "chicharrón de pescado":
                resourceId = R.drawable.chicharron_pescado;
                break;
            case "jugo de maracuyá":
                resourceId = R.drawable.jugo_maracuya;
                break;
            case "entrada: palta rellena":
                resourceId = R.drawable.palta_rellena;
                break;
            case "menú playa: ceviche + bebida":
                resourceId = R.drawable.menu_playa;
                break;
            case "menú sunset: arroz + postre":
                resourceId = R.drawable.menu_sunset;
                break;
            case "helado de coco":
                resourceId = R.drawable.helado_coco;
                break;
            case "pescado a lo macho":
                resourceId = R.drawable.pescado_macho;
                break;
            case "chicha morada":
                resourceId = R.drawable.chicha_morada;
                break;
            default:
                resourceId = R.drawable.placeholder_comida;
                break;
        }

        imageView.setImageResource(resourceId);
    }
}