package com.mypk2.app;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;
import com.mypk2.app.R;
import com.mypk2.app.adapter.ProductoOrdenAdapter;
import com.mypk2.app.model.Producto;
import com.mypk2.app.repository.ProductoRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class OrdenActivity extends AppCompatActivity implements ProductoOrdenAdapter.OnCantidadChangeListener {

    private RecyclerView recyclerView;
    private ProductoOrdenAdapter adapter;
    private ChipGroup chipGroupFiltros;
    private TextInputEditText editTextBuscador;
    private ExtendedFloatingActionButton fabResumen;

    private List<Producto> todosProductos;
    private List<Producto> productosFiltrados;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_orden);

        // Configurar toolbar
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Nueva Orden");
        }

        // Inicializar vistas
        initViews();

        // Cargar datos
        cargarProductos();

        // Configurar listeners
        configurarListeners();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewProductos);
        chipGroupFiltros = findViewById(R.id.chipGroupFiltros);
        editTextBuscador = findViewById(R.id.editTextBuscador);
        fabResumen = findViewById(R.id.fabResumen);
    }

    private void cargarProductos() {
        todosProductos = ProductoRepository.getInstance().getProductos();
        productosFiltrados = new ArrayList<>(todosProductos);

        adapter = new ProductoOrdenAdapter(this);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));
        recyclerView.setAdapter(adapter);
        adapter.setProductos(productosFiltrados);
    }

    private void configurarListeners() {
        // Filtros
        chipGroupFiltros.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) return;

            int chipId = checkedIds.get(0);
            if (chipId == R.id.chipCarta) {
                // Mostrar todos los productos
                productosFiltrados = new ArrayList<>(todosProductos);
            } else if (chipId == R.id.chipMenu) {
                // Mostrar solo activos
                productosFiltrados = ProductoRepository.getInstance().getProductosActivos();
            }

            // Aplicar búsqueda si existe
            String busqueda = editTextBuscador.getText().toString().trim();
            if (!busqueda.isEmpty()) {
                filtrarPorBusqueda(busqueda);
            } else {
                adapter.setProductos(productosFiltrados);
            }
        });

        // Buscador
        editTextBuscador.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                filtrarPorBusqueda(s.toString().trim());
            }
        });

        // Botón resumen
        fabResumen.setOnClickListener(v -> mostrarResumen());
    }

    private void filtrarPorBusqueda(String query) {
        if (query.isEmpty()) {
            adapter.setProductos(productosFiltrados);
            return;
        }

        List<Producto> resultados = new ArrayList<>();
        String queryLower = query.toLowerCase();

        for (Producto p : productosFiltrados) {
            if (p.getNombre().toLowerCase().contains(queryLower)) {
                resultados.add(p);
            }
        }

        adapter.setProductos(resultados);
    }

    private void mostrarResumen() {
        List<Producto> seleccionados = adapter.getProductosSeleccionados();
        if (seleccionados.isEmpty()) {
            Toast.makeText(this, "No hay productos seleccionados", Toast.LENGTH_SHORT).show();
            return;
        }

        // Crear mensaje del resumen
        StringBuilder mensaje = new StringBuilder("RESUMEN DE PEDIDO\n\n");
        double total = 0;

        for (Producto p : seleccionados) {
            double subtotal = p.getCantidad() * p.getPrecio();
            mensaje.append("• ").append(p.getNombre())
                    .append(" x").append(p.getCantidad())
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", subtotal))
                    .append("\n");
            total += subtotal;
        }

        mensaje.append("\nTOTAL: S/. ").append(String.format(Locale.getDefault(), "%,.2f", total));

        // Mostrar diálogo
        new MaterialAlertDialogBuilder(this)
                .setTitle("Confirmar Pedido")
                .setMessage(mensaje.toString())
                .setPositiveButton("Confirmar", (dialog, which) -> {
                    Toast.makeText(this, "Pedido confirmado exitosamente", Toast.LENGTH_SHORT).show();
                    adapter.limpiarCantidades();
                    ProductoRepository.getInstance().resetCantidades();
                    fabResumen.setText("Ver Resumen");
                    fabResumen.setVisibility(View.GONE);
                })
                .setNegativeButton("Cancelar", null)
                .setNeutralButton("Seguir Editando", null)
                .show();
    }

    @Override
    public void onCantidadChanged(Producto producto) {
        // Actualizar contador en FAB si es necesario
        List<Producto> seleccionados = adapter.getProductosSeleccionados();
        int totalItems = 0;
        for (Producto p : seleccionados) {
            totalItems += p.getCantidad();
        }

        if (totalItems > 0) {
            fabResumen.setText("Ver Resumen (" + totalItems + ")");
            fabResumen.setVisibility(View.VISIBLE);
        } else {
            fabResumen.setText("Ver Resumen");
            fabResumen.setVisibility(View.GONE);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}