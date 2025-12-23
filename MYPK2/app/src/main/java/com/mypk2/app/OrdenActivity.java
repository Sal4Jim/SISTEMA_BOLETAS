package com.mypk2.app;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.textfield.TextInputEditText;
import com.mypk2.app.adapter.ProductoOrdenAdapter;
import com.mypk2.app.model.Producto;
import com.mypk2.app.repository.ProductoRepository;
import java.util.ArrayList;
import java.util.List;

public class OrdenActivity extends AppCompatActivity implements ProductoOrdenAdapter.OnCantidadChangeListener {

    private Chip chipCarta, chipMenu;
    private ChipGroup chipGroupFiltros;
    private TextInputEditText editTextBuscador;
    private RecyclerView recyclerView;
    private ProductoOrdenAdapter adapter;
    private List<Producto> allProductos;
    private List<Producto> displayedProductos;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_orden);

        initViews();
        initAdapter();
        loadProductos();
        setupListeners();
    }

    private void initViews() {
        chipCarta = findViewById(R.id.chipCarta);
        chipMenu = findViewById(R.id.chipMenu);
        chipGroupFiltros = findViewById(R.id.chipGroupFiltros);
        editTextBuscador = findViewById(R.id.editTextBuscador);
        recyclerView = findViewById(R.id.recyclerViewProductos);
        findViewById(R.id.toolbar).setOnClickListener(v -> onBackPressed());
    }

    private void initAdapter() {
        adapter = new ProductoOrdenAdapter(this);
        recyclerView.setAdapter(adapter);
    }

    private void loadProductos() {
        allProductos = ProductoRepository.getInstance().getProductos();
        displayedProductos = new ArrayList<>(allProductos);
        adapter.setProductos(displayedProductos);
    }

    private void setupListeners() {
        chipGroupFiltros.setOnCheckedStateChangeListener((group, checkedIds) -> {
            boolean isCarta = chipCarta.getId() == checkedIds.get(0);
            editTextBuscador.setVisibility(isCarta ? View.VISIBLE : View.GONE);

            if (isCarta) {
                displayedProductos = new ArrayList<>(allProductos);
            } else {
                displayedProductos = ProductoRepository.getInstance().getProductosActivos();
            }

            filterProductos(editTextBuscador.getText().toString());
        });

        editTextBuscador.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                filterProductos(s.toString());
            }
        });
    }

    private void filterProductos(String query) {
        List<Producto> filtered = new ArrayList<>();
        String q = query.toLowerCase().trim();

        for (Producto p : displayedProductos) {
            if (q.isEmpty() || p.getNombre().toLowerCase().contains(q)) {
                filtered.add(p);
            }
        }

        adapter.setProductos(filtered);
    }

    @Override
    public void onCantidadChanged(Producto producto) {
        // Hook listo para resumen, impresión, etc.
    }
}