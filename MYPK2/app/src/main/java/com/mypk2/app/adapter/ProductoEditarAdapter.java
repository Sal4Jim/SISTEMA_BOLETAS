package com.mypk2.app.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.materialswitch.MaterialSwitch;
import com.mypk2.app.R;
import com.mypk2.app.model.Producto;
import com.mypk2.app.repository.ProductoRepository;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

public class ProductoEditarAdapter extends RecyclerView.Adapter<ProductoEditarAdapter.ViewHolder> {
    private final List<Producto> productos;
    private final OnEstadoChangeListener listener;

    public interface OnEstadoChangeListener {
        void onEstadoChanged(Producto producto, boolean isActivo);
    }

    public ProductoEditarAdapter(OnEstadoChangeListener listener) {
        this.productos = new ArrayList<>();
        this.listener = listener;
    }

    public void setProductos(List<Producto> productos) {
        this.productos.clear();
        this.productos.addAll(productos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_producto_editar, parent, false);
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
        private final TextView textViewNombre;
        private final TextView textViewPrecio;
        private final MaterialSwitch switchActivo;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textViewNombre = itemView.findViewById(R.id.textViewNombre);
            textViewPrecio = itemView.findViewById(R.id.textViewPrecio);
            switchActivo = itemView.findViewById(R.id.switchActivo);
        }

        void bind(Producto producto) {
            textViewNombre.setText(producto.getNombre());
            textViewPrecio.setText(new DecimalFormat("S/. #,##0.00").format(producto.getPrecio()));

            // Color según estado
            if (!producto.isActivo()) {
                textViewNombre.setTextColor(itemView.getContext().getColor(R.color.text_disabled));
                textViewPrecio.setTextColor(itemView.getContext().getColor(R.color.text_disabled));
            } else {
                textViewNombre.setTextColor(itemView.getContext().getColor(R.color.text_primary));
                textViewPrecio.setTextColor(itemView.getContext().getColor(R.color.text_secondary));
            }

            // Configurar switch
            switchActivo.setChecked(producto.isActivo());
            switchActivo.setOnCheckedChangeListener(null); // Clear previous listeners

            switchActivo.setOnCheckedChangeListener((buttonView, isChecked) -> {
                producto.setActivo(isChecked);
                ProductoRepository.getInstance().actualizarActivo(producto.getNombre(), isChecked);

                // Update UI colors
                if (!isChecked) {
                    textViewNombre.setTextColor(itemView.getContext().getColor(R.color.text_disabled));
                    textViewPrecio.setTextColor(itemView.getContext().getColor(R.color.text_disabled));
                } else {
                    textViewNombre.setTextColor(itemView.getContext().getColor(R.color.text_primary));
                    textViewPrecio.setTextColor(itemView.getContext().getColor(R.color.text_secondary));
                }

                // Notify listener
                if (listener != null) {
                    listener.onEstadoChanged(producto, isChecked);
                }
            });
        }
    }
}