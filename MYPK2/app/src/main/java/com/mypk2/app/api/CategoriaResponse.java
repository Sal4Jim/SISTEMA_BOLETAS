package com.mypk2.app.api;

import com.mypk2.app.model.Categoria;
import com.google.gson.annotations.SerializedName;
import java.util.List;

public class CategoriaResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("categorias")
    private List<Categoria> categorias;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public List<Categoria> getCategorias() { return categorias; }
}