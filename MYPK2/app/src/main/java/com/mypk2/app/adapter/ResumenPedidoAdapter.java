package com.mypk2.app.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.mypk2.app.R;
import com.mypk2.app.model.Producto;
import java.util.List;
import java.util.Locale;

public class ResumenPedidoAdapter extends RecyclerView.Adapter<ResumenPedidoAdapter.ViewHolder> {

    private final List<Producto> productos;
    private final int cantidadTapers;
    private final double precioTaper;

    public ResumenPedidoAdapter(List<Producto> productos, int cantidadTapers, double precioTaper) {
        this.productos = productos;
        this.cantidadTapers = cantidadTapers;
        this.precioTaper = precioTaper;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_resumen_producto, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        if (position < productos.size()) {
            Producto producto = productos.get(position);
            holder.bindProducto(producto);
        } else if (position == productos.size() && cantidadTapers > 0) {
            holder.bindTaper();
        }
    }

    @Override
    public int getItemCount() {
        int count = productos.size();
        if (cantidadTapers > 0) {
            count += 1;
        }
        return count;
    }

    public double getTotal() {
        double total = 0;
        for (Producto p : productos) {
            total += p.getCantidad() * p.getPrecio();
        }
        total += cantidadTapers * precioTaper;
        return total;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView textViewNombre;
        private final TextView textViewCantidad;
        private final TextView textViewPrecio;
        private final TextView textViewSubtotal;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textViewNombre = itemView.findViewById(R.id.textViewNombre);
            textViewCantidad = itemView.findViewById(R.id.textViewCantidad);
            textViewPrecio = itemView.findViewById(R.id.textViewPrecio);
            textViewSubtotal = itemView.findViewById(R.id.textViewSubtotal);
        }

        void bindProducto(Producto producto) {
            textViewNombre.setText(producto.getNombre());
            textViewCantidad.setText("x" + producto.getCantidad());
            textViewPrecio.setText(String.format(Locale.getDefault(), "S/. %,.2f", producto.getPrecio()));
            double subtotal = producto.getCantidad() * producto.getPrecio();
            textViewSubtotal.setText(String.format(Locale.getDefault(), "S/. %,.2f", subtotal));
        }

        void bindTaper() {
            textViewNombre.setText("Taper para llevar");
            textViewCantidad.setText("");
            textViewPrecio.setText("");
            textViewSubtotal.setText("");
        }
    }
}