package com.mypk2.app;

import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.Observer;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton;
import com.mypk2.app.R;
import com.mypk2.app.adapter.ProductoOrdenAdapter;
import com.mypk2.app.api.ApiPedido;
import com.mypk2.app.api.ApiResponse;
import com.mypk2.app.api.ApiService;
import com.mypk2.app.api.RetrofitClient;
import com.mypk2.app.model.Producto;
import com.mypk2.app.repository.ProductoRepository;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CartaActivity extends AppCompatActivity implements ProductoOrdenAdapter.OnCantidadChangeListener {

    private RecyclerView recyclerView;
    private ProductoOrdenAdapter adapter;
    private ExtendedFloatingActionButton fabResumen, fabTapers;
    // private int cantidadTapers = 0; // REEMPLAZADO POR REPOSITORIO
    private final double PRECIO_TAPER = 1.0;
    private ProductoRepository productoRepository;
    private List<Producto> listaCompletaProductos = new ArrayList<>();
    private EditText editTextSearch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_carta);

        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Carta Completa");
        }

        // Inicializar repositorio CON contexto
        productoRepository = ProductoRepository.getInstance(this);

        initViews();
        cargarProductos();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (adapter != null) {
            adapter.notifyDataSetChanged();
        }
        actualizarBotones();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewProductos);
        fabResumen = findViewById(R.id.fabResumen);
        fabTapers = findViewById(R.id.fabTapers);

        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));
        adapter = new ProductoOrdenAdapter(this);
        recyclerView.setAdapter(adapter);

        fabResumen.setOnClickListener(v -> mostrarDialogoConfirmacion());
        fabTapers.setOnClickListener(v -> mostrarDialogoTapers());

        editTextSearch = findViewById(R.id.editTextSearch);
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

        actualizarBotones();
    }

    private void cargarProductos() {
        // Observar cambios en los productos
        productoRepository.getProductosLiveData().observe(this, new Observer<List<Producto>>() {
            @Override
            public void onChanged(List<Producto> productos) {
                listaCompletaProductos = new ArrayList<>(productos);
                filtrarProductos(editTextSearch.getText().toString());
                actualizarBotones();
            }
        });

        // Cargar productos desde API (filtrado por categorías 2, 3 y 5)
        productoRepository.cargarProductosDesdeAPI("2,3,5", false); // false = todos, no solo activos
    }

    @Override
    public void onCantidadChanged(Producto producto) {
        productoRepository.actualizarProductoCarrito(producto);
        actualizarBotones();
    }

    @Override
    public void onTotalItemsChanged(int totalItems) {
        actualizarBotones();
    }

    private void actualizarBotones() {
        int cantidadTapers = productoRepository.getCantidadTapers();
        int totalItems = productoRepository.getCantidadTotalItems() + cantidadTapers;
        fabTapers.setText("Tapers: " + cantidadTapers);

        if (totalItems > 0) {
            fabResumen.setText("Ver Resumen (" + totalItems + ")");
            fabResumen.setVisibility(View.VISIBLE);
        } else {
            fabResumen.setText("Ver Resumen");
            fabResumen.setVisibility(View.GONE);
        }
    }

    private void mostrarDialogoTapers() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_tapers, null);

        TextView textViewCantidad = dialogView.findViewById(R.id.textViewCantidadTapers);
        TextView textViewTotal = dialogView.findViewById(R.id.textViewTotalTapers);
        View buttonMenos = dialogView.findViewById(R.id.buttonMenosTaper);
        View buttonMas = dialogView.findViewById(R.id.buttonMasTaper);

        textViewCantidad.setText(String.valueOf(productoRepository.getCantidadTapers()));
        actualizarTotalTapers(textViewTotal);

        buttonMenos.setOnClickListener(v -> {
            int current = productoRepository.getCantidadTapers();
            if (current > 0) {
                productoRepository.setCantidadTapers(current - 1);
                textViewCantidad.setText(String.valueOf(productoRepository.getCantidadTapers()));
                actualizarTotalTapers(textViewTotal);
                actualizarBotones();
            }
        });

        buttonMas.setOnClickListener(v -> {
            int current = productoRepository.getCantidadTapers();
            productoRepository.setCantidadTapers(current + 1);
            textViewCantidad.setText(String.valueOf(productoRepository.getCantidadTapers()));
            actualizarTotalTapers(textViewTotal);
            actualizarBotones();
        });

        new MaterialAlertDialogBuilder(this)
                .setTitle("Agregar Tapers")
                .setView(dialogView)
                .setPositiveButton("Aceptar", (dialog, which) -> {
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void filtrarProductos(String query) {
        if (listaCompletaProductos == null)
            return;

        if (query.isEmpty()) {
            adapter.setProductos(listaCompletaProductos);
        } else {
            List<Producto> filtrados = new ArrayList<>();
            String lowerQuery = query.toLowerCase();
            for (Producto p : listaCompletaProductos) {
                if (p.getNombre().toLowerCase().contains(lowerQuery)) {
                    filtrados.add(p);
                }
            }
            adapter.setProductos(filtrados);
        }
    }

    private void actualizarTotalTapers(TextView textView) {
        double totalTapers = productoRepository.getCantidadTapers() * PRECIO_TAPER;
        textView.setText(String.format(Locale.getDefault(), "Total: S/. %,.2f", totalTapers));
    }

    private void mostrarDialogoConfirmacion() {
        // USAR EL CARRITO GLOBAL EN LUGAR DEL ADAPTER
        List<Producto> productosSeleccionados = productoRepository.getProductosCarrito();
        int cantidadTapers = productoRepository.getCantidadTapers();

        if (productosSeleccionados.isEmpty() && cantidadTapers == 0) {
            Toast.makeText(this, "No hay productos seleccionados", Toast.LENGTH_SHORT).show();
            return;
        }

        View dialogView = getLayoutInflater().inflate(R.layout.dialog_confirmar_pedido, null);

        TextView textViewResumen = dialogView.findViewById(R.id.textViewResumen);
        // ... existing code ...
        TextView textViewTotal = dialogView.findViewById(R.id.textViewTotal);
        RadioGroup radioGroupTipoPedido = dialogView.findViewById(R.id.radioGroupTipoPedido);
        LinearLayout layoutMesa = dialogView.findViewById(R.id.layoutMesa);
        // EditText editTextMesa = dialogView.findViewById(R.id.editTextMesa); //
        // REMOVIDO
        android.widget.GridLayout gridMesas = dialogView.findViewById(R.id.gridMesas);
        EditText editTextObservaciones = dialogView.findViewById(R.id.editTextObservaciones);

        class ResumenPedido {
            StringBuilder texto = new StringBuilder();
            double total = 0;
            String mesaSeleccionada = "";
        }

        final ResumenPedido resumenPedido = new ResumenPedido();
        final List<Producto> productosFinal = new ArrayList<>(productosSeleccionados);
        final int tapersFinal = cantidadTapers;

        // Configurar Grid de Mesas
        for (int i = 1; i <= 15; i++) {
            final int numMesa = i;
            android.widget.Button btnMesa = new android.widget.Button(this);
            btnMesa.setText(String.valueOf(numMesa));

            // Layout params para los botones
            android.widget.GridLayout.LayoutParams params = new android.widget.GridLayout.LayoutParams();
            params.width = 0;
            params.height = android.widget.GridLayout.LayoutParams.WRAP_CONTENT;
            params.columnSpec = android.widget.GridLayout.spec(android.widget.GridLayout.UNDEFINED, 1f);
            params.setMargins(8, 8, 8, 8);
            btnMesa.setLayoutParams(params);

            // Estilo por defecto (no seleccionado)
            btnMesa.setBackgroundTintList(android.content.res.ColorStateList.valueOf(android.graphics.Color.WHITE));
            btnMesa.setTextColor(android.graphics.Color.BLACK);

            btnMesa.setOnClickListener(v -> {
                // Deseleccionar todos
                for (int j = 0; j < gridMesas.getChildCount(); j++) {
                    View child = gridMesas.getChildAt(j);
                    if (child instanceof android.widget.Button) {
                        child.setBackgroundTintList(
                                android.content.res.ColorStateList.valueOf(android.graphics.Color.WHITE));
                        ((android.widget.Button) child).setTextColor(android.graphics.Color.BLACK);
                    }
                }
                // Seleccionar actual
                btnMesa.setBackgroundTintList(android.content.res.ColorStateList.valueOf(android.graphics.Color.RED)); // o
                                                                                                                       // el
                                                                                                                       // color
                                                                                                                       // primario
                btnMesa.setTextColor(android.graphics.Color.WHITE);
                resumenPedido.mesaSeleccionada = String.valueOf(numMesa);
            });

            gridMesas.addView(btnMesa);
        }

        for (Producto p : productosSeleccionados) {
            double subtotal = p.getCantidad() * p.getPrecio();
            resumenPedido.texto.append("• ").append(p.getNombre())
                    .append(" x").append(p.getCantidad())
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", subtotal))
                    .append("\n");
            resumenPedido.total += subtotal;
        }

        // Lógica de Combos en Carta Completa
        List<Double> preciosEntradas = new ArrayList<>();
        List<Double> preciosMenus = new ArrayList<>();

        for (Producto p : productosSeleccionados) {
            if (p.getIdCategoria() == 4) { // Entrada
                for (int k = 0; k < p.getCantidad(); k++)
                    preciosEntradas.add(p.getPrecio());
            } else if (p.getIdCategoria() == 1) { // Menu
                for (int k = 0; k < p.getCantidad(); k++)
                    preciosMenus.add(p.getPrecio());
            }
        }

        java.util.Collections.sort(preciosEntradas, java.util.Collections.reverseOrder());
        java.util.Collections.sort(preciosMenus, java.util.Collections.reverseOrder());

        int numCombos = Math.min(preciosEntradas.size(), preciosMenus.size());

        if (numCombos > 0) {
            double descuentoTotal = 0;
            for (int i = 0; i < numCombos; i++) {
                double precioOriginal = preciosEntradas.get(i) + preciosMenus.get(i);
                if (precioOriginal > 12.0) {
                    descuentoTotal += (precioOriginal - 12.0);
                }
            }

            if (descuentoTotal > 0) {
                resumenPedido.total -= descuentoTotal;
                resumenPedido.texto.append("• DESCUENTO COMBO (x").append(numCombos).append(")")
                        .append(" = -S/. ").append(String.format(Locale.getDefault(), "%,.2f", descuentoTotal))
                        .append("\n");
            }
        }

        if (cantidadTapers > 0) {
            double totalTapers = cantidadTapers * PRECIO_TAPER;
            resumenPedido.texto.append("\n• Tapers para llevar")
                    .append(" x").append(cantidadTapers)
                    .append(" = S/. ").append(String.format(Locale.getDefault(), "%,.2f", totalTapers))
                    .append("\n");
            resumenPedido.total += totalTapers;
        }

        textViewResumen.setText(resumenPedido.texto.toString());
        textViewTotal.setText(String.format(Locale.getDefault(), "S/. %,.2f", resumenPedido.total));

        radioGroupTipoPedido.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.radioMesa) {
                layoutMesa.setVisibility(View.VISIBLE);
            } else if (checkedId == R.id.radioDelivery) {
                layoutMesa.setVisibility(View.GONE);
                resumenPedido.mesaSeleccionada = ""; // Limpiar selección si cambia a delivery
            }
        });

        new MaterialAlertDialogBuilder(this)
                .setTitle("Confirmar Pedido")
                .setView(dialogView)
                .setPositiveButton("Confirmar", (dialogInterface, which) -> {
                    confirmarPedido(
                            radioGroupTipoPedido.getCheckedRadioButtonId() == R.id.radioMesa ? "Mesa" : "Delivery",
                            resumenPedido.mesaSeleccionada,
                            editTextObservaciones.getText().toString().trim(),
                            productosFinal,
                            tapersFinal,
                            resumenPedido.total);
                })
                .setNeutralButton("Seguir Editando", null)
                .show();
    }

    private void confirmarPedido(String tipoPedido, String mesa, String observaciones,
            List<Producto> productos, int tapers, double total) {
        if (tipoPedido.equals("Mesa") && mesa.isEmpty()) {
            Toast.makeText(this, "Por favor ingrese el número de mesa", Toast.LENGTH_SHORT).show();
            return;
        }

        // Verificar conexión
        if (!RetrofitClient.isNetworkAvailable(this)) {
            Toast.makeText(this, "No hay conexión a internet", Toast.LENGTH_LONG).show();
            return;
        }

        // Crear lista de productos para API
        List<ApiPedido.ProductoPedido> productosApi = new ArrayList<>();
        for (Producto p : productos) {
            if (p.getCantidad() > 0) {
                productosApi.add(new ApiPedido.ProductoPedido(p.getId(), p.getCantidad()));
            }
        }

        // Preparar datos
        String ubicacion = tipoPedido.equals("Mesa") ? mesa : "delivery";
        String notasCompletas = observaciones;

        if (tapers > 0) {
            // Taper ID 6
            productosApi.add(new ApiPedido.ProductoPedido(6, tapers));
        }

        // El total ya incluye los tapers porque viene calculado del resumen
        double totalFinal = total;

        // Crear objeto API
        ApiPedido apiPedido = new ApiPedido(
                ubicacion,
                notasCompletas,
                totalFinal,
                productosApi);

        // Enviar a la API
        enviarPedidoApi(apiPedido, productos, tapers);
    }

    private void enviarPedidoApi(ApiPedido apiPedido, List<Producto> productos, int tapers) {
        Toast.makeText(this, "Enviando pedido...", Toast.LENGTH_SHORT).show();

        ApiService apiService = RetrofitClient.getApiService();

        apiService.enviarPedido(apiPedido).enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse apiResponse = response.body();

                    if (apiResponse.isSuccess()) {
                        runOnUiThread(() -> {
                            Toast.makeText(CartaActivity.this,
                                    "✓ Pedido #" + apiResponse.getIdPedido() + " confirmado",
                                    Toast.LENGTH_LONG).show();

                            // Limpiar selección
                            limpiarTodo();
                        });
                    } else {
                        runOnUiThread(() -> Toast.makeText(CartaActivity.this,
                                "Error: " + apiResponse.getMessage(),
                                Toast.LENGTH_LONG).show());
                    }
                } else {
                    runOnUiThread(() -> {
                        String errorMsg = "Error del servidor: " + response.code();
                        try {
                            if (response.errorBody() != null) {
                                errorMsg += " - " + response.errorBody().string();
                            }
                        } catch (Exception e) {
                            errorMsg += " - No se pudo leer el error";
                        }
                        Toast.makeText(CartaActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                    });
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                runOnUiThread(() -> {
                    Toast.makeText(CartaActivity.this,
                            "Error de conexión: " + t.getMessage(),
                            Toast.LENGTH_LONG).show();

                    // Opcional: Guardar localmente para reintentar después
                    guardarPedidoLocal(apiPedido, productos, tapers, 0);
                });
            }
        });
    }

    private void guardarPedidoLocal(ApiPedido apiPedido, List<Producto> productos, int tapers, int idRemoto) {
        // Aquí puedes guardar en SQLite si quieres persistencia local
        String fecha = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(new Date());

        System.out.println("Pedido local guardado (Carta):");
        System.out.println("Mesa: " + apiPedido.getMesa());
        System.out.println("Notas: " + apiPedido.getNotas());
        System.out.println("Total: S/. " + apiPedido.getTotalEstimado());
        System.out.println("Fecha: " + fecha);
        System.out.println("ID remoto: " + idRemoto);

        for (ApiPedido.ProductoPedido pp : apiPedido.getProductos()) {
            System.out.println("  Producto ID: " + pp.getIdProducto() + " x " + pp.getCantidad());
        }
    }

    private void limpiarTodo() {
        // Limpiamos la lista local explícitamente
        if (listaCompletaProductos != null) {
            for (Producto p : listaCompletaProductos) {
                p.setCantidad(0);
            }
        }

        adapter.limpiarCantidades();
        productoRepository.resetCantidades();
        // cantidadTapers = 0; // Ya se resetea en el repositorio
        actualizarBotones();

        adapter.notifyDataSetChanged();
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