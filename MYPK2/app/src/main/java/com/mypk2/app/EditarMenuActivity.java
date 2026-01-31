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
import java.util.ArrayList;
import java.util.List;
import android.widget.EditText;
import androidx.lifecycle.Observer;

public class EditarMenuActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ProductoEditarAdapter adapter;
    private View emptyState;
    private TextView textViewTotalProductos, textViewActivos, textViewInactivos;
    private ProductoRepository productoRepository;
    private EditText editTextSearch;
    private List<Producto> listaCompletaProductos = new ArrayList<>();

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
        editTextSearch = findViewById(R.id.editTextSearch);

        // Configurar Buscador
        editTextSearch.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filtrarProductos(s.toString());
            }

            @Override
            public void afterTextChanged(android.text.Editable s) {
            }
        });

        // Configurar RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ProductoEditarAdapter(productoRepository);
        recyclerView.setAdapter(adapter);

        // Configurar listener para actualizar estadísticas cuando cambie el estado
        adapter.setOnEstadoChangeListener(() -> actualizarEstadisticas());

        setupObservers();
    }

    private void setupObservers() {
        // Observar cambios en los productos
        productoRepository.getProductosLiveData().observe(this, new Observer<List<Producto>>() {
            @Override
            public void onChanged(List<Producto> productos) {
                listaCompletaProductos = new ArrayList<>(productos);
                filtrarProductos(editTextSearch.getText().toString());
                actualizarEstadisticas();

                // Actualizar estado vacio inicial si es necesario
                if (productos.isEmpty()) {
                    emptyState.setVisibility(View.VISIBLE);
                    recyclerView.setVisibility(View.GONE);
                } else {
                    emptyState.setVisibility(View.GONE);
                    recyclerView.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    private void cargarProductos() {
        // Cargar productos de ID_CATEGORIA 1 (Menú) y 4 (Entrada)
        productoRepository.cargarProductosDesdeAPI("1,4");
    }

    private void filtrarProductos(String query) {
        if (listaCompletaProductos == null)
            return;

        List<Producto> productosAMostrar;
        if (query.isEmpty()) {
            productosAMostrar = new ArrayList<>(listaCompletaProductos);
        } else {
            List<Producto> filtrados = new ArrayList<>();
            String lowerQuery = query.toLowerCase();
            for (Producto p : listaCompletaProductos) {
                if (p.getNombre().toLowerCase().contains(lowerQuery)) {
                    filtrados.add(p);
                }
            }
            productosAMostrar = filtrados;
        }

        adapter.setProductos(productosAMostrar);

        // Actualizar visibilidad basado en el filtro
        if (productosAMostrar.isEmpty() && !listaCompletaProductos.isEmpty()) {
            // Podríamos mostrar un estado de "no se encontraron resultados" diferente al
            // "emptyState" general,
            // pero por ahora mantendremos el recycler vacío o visible.
            // Si queremos ocultar el recycler si no hay matches:
            // recyclerView.setVisibility(View.GONE);
            // Pero mejor dejarlo visible para que se vea que no hay items.
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