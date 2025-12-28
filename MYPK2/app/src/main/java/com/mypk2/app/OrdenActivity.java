package com.mypk2.app;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;
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
    private ExtendedFloatingActionButton fabResumen, fabTapers;

    private List<Producto> todosProductos;
    private List<Producto> productosFiltrados;
    private int cantidadTapers = 0;
    private final double PRECIO_TAPER = 1.0;
    private ProductoRepository productoRepository;

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

        // Inicializar repositorio
        productoRepository = ProductoRepository.getInstance(this);

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
        fabTapers = findViewById(R.id.fabTapers);
    }

    private void cargarProductos() {
        todosProductos = productoRepository.getProductos();
        productosFiltrados = new ArrayList<>(todosProductos);

        adapter = new ProductoOrdenAdapter(this);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));
        recyclerView.setAdapter(adapter);
        adapter.setProductos(productosFiltrados);
    }

    private void configurarListeners() {
        // Filtros - CORREGIDO
        chipGroupFiltros.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) {
                // Si no hay selección, mostrar todos
                productosFiltrados = new ArrayList<>(todosProductos);
            } else {
                int chipId = checkedIds.get(0);
                if (chipId == R.id.chipCarta) {
                    // Mostrar todos los productos
                    productosFiltrados = new ArrayList<>(todosProductos);
                } else if (chipId == R.id.chipMenu) {
                    // Mostrar solo productos ACTIVOS
                    productosFiltrados = filtrarProductosActivos(todosProductos);
                }
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
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                filtrarPorBusqueda(s.toString().trim());
            }
        });

        // Botón tapers
        fabTapers.setOnClickListener(v -> mostrarDialogoTapers());

        // Botón resumen
        fabResumen.setOnClickListener(v -> mostrarResumen());
    }

    private List<Producto> filtrarProductosActivos(List<Producto> productos) {
        List<Producto> activos = new ArrayList<>();
        for (Producto p : productos) {
            if (p.isActivo()) {
                activos.add(p);
            }
        }
        return activos;
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

    private void mostrarDialogoTapers() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_tapers, null);

        TextView textViewCantidad = dialogView.findViewById(R.id.textViewCantidadTapers);
        TextView textViewTotal = dialogView.findViewById(R.id.textViewTotalTapers);
        View buttonMenos = dialogView.findViewById(R.id.buttonMenosTaper);
        View buttonMas = dialogView.findViewById(R.id.buttonMasTaper);

        // Actualizar vista inicial
        textViewCantidad.setText(String.valueOf(cantidadTapers));
        actualizarTotalTapers(textViewTotal);

        buttonMenos.setOnClickListener(v -> {
            if (cantidadTapers > 0) {
                cantidadTapers--;
                textViewCantidad.setText(String.valueOf(cantidadTapers));
                actualizarTotalTapers(textViewTotal);
                actualizarTextoBotonTapers();
                actualizarResumenButton();
            }
        });

        buttonMas.setOnClickListener(v -> {
            cantidadTapers++;
            textViewCantidad.setText(String.valueOf(cantidadTapers));
            actualizarTotalTapers(textViewTotal);
            actualizarTextoBotonTapers();
            actualizarResumenButton();
        });

        new MaterialAlertDialogBuilder(this)
                .setTitle("Agregar Tapers")
                .setView(dialogView)
                .setPositiveButton("Aceptar", (dialog, which) -> {
                    // Los cambios ya se aplicaron en tiempo real
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void actualizarTotalTapers(TextView textView) {
        double totalTapers = cantidadTapers * PRECIO_TAPER;
        textView.setText(String.format(Locale.getDefault(), "Total: S/. %,.2f", totalTapers));
    }

    private void actualizarTextoBotonTapers() {
        fabTapers.setText("Tapers: " + cantidadTapers);
    }

    private void actualizarResumenButton() {
        int totalItems = 0;
        try {
            totalItems = adapter.getTotalItems() + cantidadTapers;
        } catch (Exception e) {
            totalItems = cantidadTapers;
        }

        if (totalItems > 0) {
            fabResumen.setText("Ver Resumen (" + totalItems + ")");
            fabResumen.setVisibility(View.VISIBLE);
        } else {
            fabResumen.setText("Ver Resumen");
            fabResumen.setVisibility(View.GONE);
        }
    }

    private void mostrarResumen() {
        List<Producto> seleccionados = adapter.getProductosSeleccionados();
        if (seleccionados.isEmpty() && cantidadTapers == 0) {
            Toast.makeText(this, "No hay productos seleccionados", Toast.LENGTH_SHORT).show();
            return;
        }

        // Crear mensaje del resumen
        StringBuilder mensaje = new StringBuilder("RESUMEN DE PEDIDO\n\n");
        double totalProductos = 0;

        // Productos
        for (Producto p : seleccionados) {
            double subtotal = p.getCantidad() * p.getPrecio();
            mensaje.append("• ").append(p.getNombre())
                    .append(" x").append(p.getCantidad())
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", subtotal))
                    .append("\n");
            totalProductos += subtotal;
        }

        // Tapers
        double totalTapersCalculado = cantidadTapers * PRECIO_TAPER;
        if (cantidadTapers > 0) {
            mensaje.append("\n• Tapers")
                    .append(" x").append(cantidadTapers)
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", totalTapersCalculado))
                    .append("\n");
        }

        double totalGeneral = totalProductos + totalTapersCalculado;

        mensaje.append("\n━━━━━━━━━━━━━━━━━━━━\n");
        mensaje.append("TOTAL: S/. ").append(String.format(Locale.getDefault(), "%,.2f", totalGeneral));

        // Mostrar diálogo
        new MaterialAlertDialogBuilder(this)
                .setTitle("Confirmar Pedido")
                .setMessage(mensaje.toString())
                .setPositiveButton("Confirmar", (dialog, which) -> {
                    Toast.makeText(this, "Pedido confirmado exitosamente", Toast.LENGTH_SHORT).show();
                    // Limpiar todo
                    adapter.limpiarCantidades();
                    productoRepository.resetCantidades();
                    cantidadTapers = 0;
                    actualizarTextoBotonTapers();
                    fabResumen.setText("Ver Resumen");
                    fabResumen.setVisibility(View.GONE);
                })
                .setNeutralButton("Seguir Editando", null)
                .show();
    }

    @Override
    public void onCantidadChanged(Producto producto) {
        // Este método es necesario por la interfaz
    }

    @Override
    public void onTotalItemsChanged(int totalItems) {
        actualizarResumenButton();
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