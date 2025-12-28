package com.mypk2.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class HomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        // Asegúrate de que los IDs coincidan con tu XML
        View btnCarta = findViewById(R.id.btnCarta);
        View btnMenu = findViewById(R.id.btnMenu);
        View btnEditarMenu = findViewById(R.id.btnEditarMenu);

        if (btnCarta != null) {
            btnCarta.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, CartaActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }

        if (btnMenu != null) {
            btnMenu.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, MenuActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }

        if (btnEditarMenu != null) {
            btnEditarMenu.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, EditarMenuActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}