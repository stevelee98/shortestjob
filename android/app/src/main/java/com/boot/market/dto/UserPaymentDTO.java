package com.boot.market.dto;

import com.facebook.react.bridge.ReadableMap;

import java.io.Serializable;
import java.math.BigDecimal;

public class UserPaymentDTO implements Serializable {

    private Integer userId; //User id
    private String email; //Email
    private String phone; //Phone
    private String lang; //Language
    private BigDecimal total; //Money
    private String bankCode; //Bank Code
    private Integer groupType; //Group type
    private BigDecimal fee; //Fee
    private String orderCode; //Order code
    private String orderName; //Order name
    private String token; //User token

    public UserPaymentDTO(ReadableMap data) {
        this.email = data.getString("email");
        this.bankCode = data.getString("bankCode");
        this.phone = data.getString("phone");
        this.userId = data.getInt("userId");
        this.groupType = data.getInt("group");
        this.lang = data.getString("language");
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getOrderName() {
        return orderName;
    }

    public void setOrderName(String orderName) {
        this.orderName = orderName;
    }

    public String getBankCode() {
        return bankCode;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getGroupType() {
        return groupType;
    }

    public void setGroupType(Integer groupType) {
        this.groupType = groupType;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

}
