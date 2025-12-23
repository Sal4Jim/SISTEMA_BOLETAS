package com.mypk2.app.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.mypk2.app.R;
import com.mypk2.app.model.Producto;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductoOrdenAdapter extends RecyclerView.Adapter<ProductoOrdenAdapter.ViewHolder> {
    private final List<Producto> productos;
    private final OnCantidadChangeListener listener;

    public interface OnCantidadChangeListener {
        void onCantidadChanged(Producto producto);
    }

    public ProductoOrdenAdapter(OnCantidadChangeListener listener) {
        this.productos = new ArrayList<>();
        this.listener = listener;
    }

    public void setProductos(List<Producto> productos) {
        this.productos.clear();
        this.productos.addAll(productos);
        notifyDataSetChanged();
    }

    public List<Producto> getProductosSeleccionados() {
        List<Producto> seleccionados = new ArrayList<>();
        for (Producto p : productos) {
            if (p.getCantidad() > 0) seleccionados.add(p);
        }
        return seleccionados;
    }

    public double getTotal() {
        double total = 0;
        for (Producto p : productos) {
            total += p.getCantidad() * p.getPrecio();
        }
        return total;
    }

    public void limpiarCantidades() {
        for (Producto p : productos) {
            p.setCantidad(0);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_producto_orden, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Producto p = productos.get(position);
        holder.bind(p);
    }

    @Override
    public int getItemCount() {
        return productos.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView textViewNombre, textViewPrecio, textViewCantidad, textViewEstado;
        private final Button buttonMenos, buttonMas;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textViewNombre = itemView.findViewById(R.id.textViewNombre);
            textViewPrecio = itemView.findViewById(R.id.textViewPrecio);
            textViewCantidad = itemView.findViewById(R.id.textViewCantidad);
            textViewEstado = itemView.findViewById(R.id.textViewEstado);
            buttonMenos = itemView.findViewById(R.id.buttonMenos);
            buttonMas = itemView.findViewById(R.id.buttonMas);
        }

        void bind(Producto producto) {
            textViewNombre.setText(producto.getNombre());
            // Usar String.format en lugar de DecimalFormat
            textViewPrecio.setText(String.format(Locale.getDefault(), "S/. %,.2f", producto.getPrecio()));
            textViewCantidad.setText(String.valueOf(producto.getCantidad()));

            // Estado activo/inactivo
            if (!producto.isActivo()) {
                textViewEstado.setVisibility(View.VISIBLE);
                buttonMenos.setEnabled(false);
                buttonMas.setEnabled(false);
                itemView.setAlpha(0.6f);
            } else {
                textViewEstado.setVisibility(View.GONE);
                buttonMenos.setEnabled(producto.getCantidad() > 0);
                buttonMas.setEnabled(true);
                itemView.setAlpha(1f);
            }

            buttonMenos.setOnClickListener(v -> {
                if (producto.isActivo() && producto.getCantidad() > 0) {
                    producto.setCantidad(producto.getCantidad() - 1);
                    textViewCantidad.setText(String.valueOf(producto.getCantidad()));
                    buttonMenos.setEnabled(producto.getCantidad() > 0);
                    if (listener != null) listener.onCantidadChanged(producto);
                }
            });

            buttonMas.setOnClickListener(v -> {
                if (producto.isActivo()) {
                    producto.setCantidad(producto.getCantidad() + 1);
                    textViewCantidad.setText(String.valueOf(producto.getCantidad()));
                    buttonMenos.setEnabled(true);
                    if (listener != null) listener.onCantidadChanged(producto);
                }
            });
        }
    }
}