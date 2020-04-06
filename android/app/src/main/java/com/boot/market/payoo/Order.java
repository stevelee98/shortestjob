package com.boot.market.payoo;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import com.facebook.react.bridge.ReadableMap;

import java.io.Serializable;

public class Order implements Serializable {

    @Expose
    @SerializedName("checksum")
    private String checksum;

    @Expose
    @SerializedName("orderInfo")
    private String orderInfo;

    @Expose
    @SerializedName("token")
    private String token;

    @Expose
    @SerializedName("message")
    private String message;

    public Order(ReadableMap map) {
        ReadableMap dataPayoo = map.getMap("data");
        this.checksum = dataPayoo.getString("checksum");
        this.orderInfo = dataPayoo.getString("orderInfo");
        this.token = dataPayoo.getString("token");
        this.message = dataPayoo.getString("message");
    }

    public String getChecksum() {
        return checksum;
    }

    public String getOrderInfo() {
        return orderInfo;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
