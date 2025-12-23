package com.mypk2.app;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class HomeActivity extends AppCompatActivity {

    private static final String TAG = "HomeActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        View btnOrden = findViewById(R.id.btnOrden);
        View btnEditarMenu = findViewById(R.id.btnEditarMenu);

        btnOrden.setOnClickListener(v -> {
            try {
                Log.d(TAG, "Intentando abrir OrdenActivity...");
                startActivity(new Intent(this, OrdenActivity.class));
                Log.d(TAG, "OrdenActivity abierta exitosamente");
            } catch (Exception e) {
                Log.e(TAG, "Error al abrir OrdenActivity: " + e.getMessage(), e);
                Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });

        btnEditarMenu.setOnClickListener(v -> {
            try {
                Log.d(TAG, "Intentando abrir EditarMenuActivity...");
                startActivity(new Intent(this, EditarMenuActivity.class));
                Log.d(TAG, "EditarMenuActivity abierta exitosamente");
            } catch (Exception e) {
                Log.e(TAG, "Error al abrir EditarMenuActivity: " + e.getMessage(), e);
                Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}