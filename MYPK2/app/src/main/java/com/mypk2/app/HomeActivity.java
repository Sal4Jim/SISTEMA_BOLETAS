package com.mypk2.app;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;

public class HomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        MaterialButton btnOrden = findViewById(R.id.btnOrden);
        MaterialButton btnEditarMenu = findViewById(R.id.btnEditarMenu);

        btnOrden.setOnClickListener(v -> {
            startActivity(new Intent(this, OrdenActivity.class));
        });

        btnEditarMenu.setOnClickListener(v -> {
            startActivity(new Intent(this, EditarMenuActivity.class));
        });
    }
}