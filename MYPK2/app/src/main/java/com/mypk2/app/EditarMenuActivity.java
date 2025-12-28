package com.mypk2.app;

import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
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
    private View emptyState;
    private TextView textViewTotalProductos, textViewActivos, textViewInactivos;
    private ProductoRepository productoRepository;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_editar_menu);

        // Configurar toolbar
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Editar Menú");

        // Inicializar repositorio
        productoRepository = ProductoRepository.getInstance(this);

        // Inicializar vistas
        initViews();

        // Cargar productos y estadísticas
        cargarProductos();
        actualizarEstadisticas();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewProductos);
        emptyState = findViewById(R.id.emptyState);
        textViewTotalProductos = findViewById(R.id.textViewTotalProductos);
        textViewActivos = findViewById(R.id.textViewActivos);
        textViewInactivos = findViewById(R.id.textViewInactivos);

        // Configurar RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ProductoEditarAdapter(productoRepository);
        recyclerView.setAdapter(adapter);

        // Configurar listener para actualizar estadísticas cuando cambie el estado
        adapter.setOnEstadoChangeListener(() -> actualizarEstadisticas());
    }

    private void cargarProductos() {
        // Cargar productos de ID_CATEGORIA 1 (Menú) y 4 (Entrada)
        productoRepository.cargarProductosDesdeAPI("1,4");
        List<Producto> productos = productoRepository.getProductos();
        adapter.setProductos(productos);

        // Mostrar estado vacío si no hay productos
        if (productos.isEmpty()) {
            emptyState.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
        } else {
            emptyState.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }

    private void actualizarEstadisticas() {
        int total = productoRepository.getTotalProductos();
        int activos = productoRepository.getProductosActivosCount();
        int inactivos = productoRepository.getProductosInactivosCount();

        textViewTotalProductos.setText(String.valueOf(total));
        textViewActivos.setText(String.valueOf(activos));
        textViewInactivos.setText(String.valueOf(inactivos));
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Actualizar datos cuando se regrese a la actividad
        cargarProductos();
        actualizarEstadisticas();
    }
}