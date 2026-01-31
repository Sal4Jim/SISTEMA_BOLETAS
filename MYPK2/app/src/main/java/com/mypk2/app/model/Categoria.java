package com.mypk2.app.model;

import com.google.gson.annotations.SerializedName;

public class Categoria {
    @SerializedName("id_categoria")
    private int id;

    @SerializedName("nombre")
    private String nombre;

    @SerializedName("activo")
    private boolean activo;

    public Categoria() {
        // Constructor vacío para Gson
    }

    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    @Override
    public String toString() {
        return nombre;
    }
}