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
    // private int cantidadTapers = 0; // REEMPLAZADO POR REPOSITORIO
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

    @Override
    protected void onResume() {
        super.onResume();
        if (adapter != null) {
            adapter.notifyDataSetChanged();
        }
        actualizarTextoBotonTapers();
        actualizarResumenButton();
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
        textViewCantidad.setText(String.valueOf(productoRepository.getCantidadTapers()));
        actualizarTotalTapers(textViewTotal);

        buttonMenos.setOnClickListener(v -> {
            int current = productoRepository.getCantidadTapers();
            if (current > 0) {
                productoRepository.setCantidadTapers(current - 1);
                textViewCantidad.setText(String.valueOf(productoRepository.getCantidadTapers()));
                actualizarTotalTapers(textViewTotal);
                actualizarTextoBotonTapers();
                actualizarResumenButton();
            }
        });

        buttonMas.setOnClickListener(v -> {
            int current = productoRepository.getCantidadTapers();
            productoRepository.setCantidadTapers(current + 1);
            textViewCantidad.setText(String.valueOf(productoRepository.getCantidadTapers()));
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
        double totalTapers = productoRepository.getCantidadTapers() * PRECIO_TAPER;
        textView.setText(String.format(Locale.getDefault(), "Total: S/. %,.2f", totalTapers));
    }

    private void actualizarTextoBotonTapers() {
        fabTapers.setText("Tapers: " + productoRepository.getCantidadTapers());
    }

    private void actualizarResumenButton() {
        int totalItems = 0;
        // Calcular items totales incluyendo ocultos/filtrados
        if (todosProductos != null) {
            for (Producto p : todosProductos) {
                totalItems += p.getCantidad();
            }
        }

        // Sumar tapers
        totalItems += productoRepository.getCantidadTapers();

        if (totalItems > 0) {
            fabResumen.setText("Ver Resumen (" + totalItems + ")");
            fabResumen.setVisibility(View.VISIBLE);
        } else {
            fabResumen.setText("Ver Resumen");
            fabResumen.setVisibility(View.GONE);
        }
    }

    private void mostrarResumen() {
        // Obtener TODOS los productos con cantidad > 0
        List<Producto> seleccionados = new ArrayList<>();
        if (todosProductos != null) {
            for (Producto p : todosProductos) {
                if (p.getCantidad() > 0) {
                    seleccionados.add(p);
                }
            }
        }

        if (seleccionados.isEmpty() && productoRepository.getCantidadTapers() == 0) {
            Toast.makeText(this, "No hay productos seleccionados", Toast.LENGTH_SHORT).show();
            return;
        }

        // Lógica para COMBO: Categoría 1 (Menu) + Categoría 4 (Entrada) = 12 soles
        List<Producto> itemsMenu = new ArrayList<>();
        List<Producto> itemsEntrada = new ArrayList<>();
        List<Producto> itemsOtros = new ArrayList<>();

        // Desglosar productos por unidad para facilitar el emparejamiento
        for (Producto p : seleccionados) {
            for (int i = 0; i < p.getCantidad(); i++) {
                if (p.getIdCategoria() == 1) { // Menu
                    itemsMenu.add(p);
                } else if (p.getIdCategoria() == 4) { // Entrada
                    itemsEntrada.add(p);
                } else {
                    itemsOtros.add(p);
                }
            }
        }

        // Calcular pares
        int numCombos = Math.min(itemsMenu.size(), itemsEntrada.size());
        int itemsMenuSueltos = itemsMenu.size() - numCombos;
        int itemsEntradaSueltos = itemsEntrada.size() - numCombos;

        double totalCombos = numCombos * 12.00;
        double totalMenuSueltos = 0;
        double totalEntradaSueltos = 0;
        double totalOtros = 0;

        // Sumar menús sueltos (los que sobran)
        // Nota: Si hubiera precios distintos, idealmente ordenaríamos por precio
        // descendente antes
        for (int i = numCombos; i < itemsMenu.size(); i++) {
            totalMenuSueltos += itemsMenu.get(i).getPrecio();
        }

        // Sumar entradas sueltas
        for (int i = numCombos; i < itemsEntrada.size(); i++) {
            totalEntradaSueltos += itemsEntrada.get(i).getPrecio();
        }

        // Sumar otros
        for (Producto p : itemsOtros) {
            totalOtros += p.getPrecio();
        }

        int cantidadTapers = productoRepository.getCantidadTapers();
        double totalTapersCalculado = cantidadTapers * PRECIO_TAPER;
        double totalGeneral = totalCombos + totalMenuSueltos + totalEntradaSueltos + totalOtros + totalTapersCalculado;

        // Construir mensaje
        StringBuilder mensaje = new StringBuilder("RESUMEN DE PEDIDO\n\n");

        // Listar productos (visualización normal agrupada)
        for (Producto p : seleccionados) {
            double subtotal = p.getCantidad() * p.getPrecio();
            mensaje.append("• ").append(p.getNombre())
                    .append(" x").append(p.getCantidad())
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", subtotal))
                    .append("\n");
        }

        // Tapers
        if (cantidadTapers > 0) {
            mensaje.append("\n• Tapers")
                    .append(" x").append(cantidadTapers)
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", totalTapersCalculado))
                    .append("\n");
        }

        mensaje.append("\n━━━━━━━━━━━━━━━━━━━━\n");

        // Mostrar detalle del ahorro si aplica
        if (numCombos > 0) {
            // Calcular cuánto costaría sin descuento para mostrar el ahorro
            // (Opcional, pero ayuda a validar)
            double precioMenusCombo = 0;
            for (int i = 0; i < numCombos; i++)
                precioMenusCombo += itemsMenu.get(i).getPrecio();

            double precioEntradasCombo = 0;
            for (int i = 0; i < numCombos; i++)
                precioEntradasCombo += itemsEntrada.get(i).getPrecio();

            double precioOriginalCombos = precioMenusCombo + precioEntradasCombo;
            double ahorro = precioOriginalCombos - totalCombos;

            mensaje.append("Combos aplicados: ").append(numCombos).append("\n");
            mensaje.append("Ahorro por combos: -S/. ").append(String.format(Locale.getDefault(), "%,.2f", ahorro))
                    .append("\n");
            mensaje.append("────────────────────\n");
        }

        mensaje.append("TOTAL A PAGAR: S/. ").append(String.format(Locale.getDefault(), "%,.2f", totalGeneral));

        // Mostrar diálogo
        new MaterialAlertDialogBuilder(this)
                .setTitle("Confirmar Pedido")
                .setMessage(mensaje.toString())
                .setPositiveButton("Confirmar", (dialog, which) -> {
                    Toast.makeText(this, "Pedido confirmado exitosamente", Toast.LENGTH_SHORT).show();

                    // Limpiar todo (incluyendo ocultos)
                    if (todosProductos != null) {
                        for (Producto p : todosProductos) {
                            p.setCantidad(0);
                        }
                    }

                    // Actualizar repositorio y adaptador
                    productoRepository.resetCantidades();
                    adapter.notifyDataSetChanged();

                    // cantidadTapers = 0; // Ya se resetea en el repositorio
                    actualizarTextoBotonTapers();
                    actualizarResumenButton();
                })
                .setNeutralButton("Seguir Editando", null)
                .show();
    }

    @Override
    public void onCantidadChanged(Producto producto) {
        // Actualizar repositorio para persistencia global
        productoRepository.actualizarProductoCarrito(producto);
        // Actualizar botón de resumen
        actualizarResumenButton();
    }

    @Override
    public void onTotalItemsChanged(int totalItems) {
        // Ignoramos el totalItems del adaptador porque solo cuenta visibles
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