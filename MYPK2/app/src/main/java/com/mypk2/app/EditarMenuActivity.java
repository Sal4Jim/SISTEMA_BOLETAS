package com.mypk2.app;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.mypk2.app.R;
import com.mypk2.app.adapter.ProductoEditarAdapter;
import com.mypk2.app.model.Producto;
import com.mypk2.app.repository.ProductoRepository;

import java.util.List;

public class EditarMenuActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ProductoEditarAdapter adapter;
    private TextView textViewActivosCount;
    private ProductoRepository repository;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_editar_menu);

        initViews();
        initToolbar();
        initRecyclerView();
        loadProductos();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewProductos);
        textViewActivosCount = findViewById(R.id.textViewActivosCount);
        repository = ProductoRepository.getInstance();
    }

    private void initToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
            getSupportActionBar().setTitle("Editar Menú");
        }

        toolbar.setNavigationOnClickListener(v -> onBackPressed());
    }

    private void initRecyclerView() {
        adapter = new ProductoEditarAdapter(new ProductoEditarAdapter.OnEstadoChangeListener() {
            @Override
            public void onEstadoChanged(Producto producto, boolean isActivo) {
                // Actualizar contador inmediatamente
                updateActivosCount();

                // Mostrar feedback
                String estado = isActivo ? "activado" : "desactivado";
                String mensaje = producto.getNombre() + " " + estado;
                Toast.makeText(EditarMenuActivity.this, mensaje, Toast.LENGTH_SHORT).show();
            }
        });

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(adapter);
        recyclerView.setHasFixedSize(true);
    }

    private void loadProductos() {
        List<Producto> productos = repository.getProductos();
        adapter.setProductos(productos);
        updateActivosCount();
    }

    private void updateActivosCount() {
        List<Producto> productos = repository.getProductos();
        int activos = 0;
        int total = productos.size();

        for (Producto p : productos) {
            if (p.isActivo()) activos++;
        }

        textViewActivosCount.setText(activos + "/" + total);

        // Cambiar color según cantidad de activos
        if (activos == 0) {
            textViewActivosCount.setTextColor(getColor(R.color.error));
        } else if (activos == total) {
            textViewActivosCount.setTextColor(getColor(R.color.success));
        } else {
            textViewActivosCount.setTextColor(getColor(R.color.warning));
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
    }
}