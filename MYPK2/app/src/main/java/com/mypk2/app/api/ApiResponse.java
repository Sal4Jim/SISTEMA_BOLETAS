package com.mypk2.app.api;

import com.google.gson.annotations.SerializedName;

public class ApiResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("id_pedido")
    private int idPedido;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public int getIdPedido() { return idPedido; }
}