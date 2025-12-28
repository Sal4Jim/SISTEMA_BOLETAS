package com.mypk2.app.api;

import com.mypk2.app.model.Producto;
import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ProductoResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("productos")
    private List<Producto> productos;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public List<Producto> getProductos() { return productos; }
}