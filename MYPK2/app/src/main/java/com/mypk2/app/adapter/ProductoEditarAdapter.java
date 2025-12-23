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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductoEditarAdapter extends RecyclerView.Adapter<ProductoEditarAdapter.ViewHolder> {
    private final List<Producto> productos;
    private OnEstadoChangeListener estadoChangeListener;

    public interface OnEstadoChangeListener {
        void onEstadoChanged();
    }

    public ProductoEditarAdapter() {
        this.productos = new ArrayList<>();
    }

    public void setProductos(List<Producto> productos) {
        this.productos.clear();
        this.productos.addAll(productos);
        notifyDataSetChanged();
    }

    public void setOnEstadoChangeListener(OnEstadoChangeListener listener) {
        this.estadoChangeListener = listener;
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
        private final TextView textViewEstado;
        private final MaterialSwitch switchActivo;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textViewNombre = itemView.findViewById(R.id.textViewNombre);
            textViewPrecio = itemView.findViewById(R.id.textViewPrecio);
            textViewEstado = itemView.findViewById(R.id.textViewEstado);
            switchActivo = itemView.findViewById(R.id.switchActivo);
        }

        void bind(Producto producto) {
            textViewNombre.setText(producto.getNombre());
            // Usar String.format en lugar de DecimalFormat
            textViewPrecio.setText(String.format(Locale.getDefault(), "S/. %,.2f", producto.getPrecio()));
            switchActivo.setChecked(producto.isActivo());

            // Mostrar estado visual
            if (producto.isActivo()) {
                textViewEstado.setText("ACTIVO");
                textViewEstado.setBackgroundResource(R.drawable.bg_estado_activo);
            } else {
                textViewEstado.setText("INACTIVO");
                textViewEstado.setBackgroundResource(R.drawable.bg_estado_inactivo);
            }

            switchActivo.setOnCheckedChangeListener((buttonView, isChecked) -> {
                producto.setActivo(isChecked);
                ProductoRepository.getInstance().actualizarActivo(producto.getNombre(), isChecked);

                // Notificar cambio de estado
                if (estadoChangeListener != null) {
                    estadoChangeListener.onEstadoChanged();
                }

                // Actualizar estado visual inmediatamente
                if (isChecked) {
                    textViewEstado.setText("ACTIVO");
                    textViewEstado.setBackgroundResource(R.drawable.bg_estado_activo);
                } else {
                    textViewEstado.setText("INACTIVO");
                    textViewEstado.setBackgroundResource(R.drawable.bg_estado_inactivo);
                }
            });
        }
    }
}