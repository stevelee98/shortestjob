package com.boot.market;

import android.content.Intent;

import com.boot.market.dto.UserPaymentDTO;
import com.boot.market.payoo.Order;
import com.boot.market.payoo.PayooActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class PayooStarterModule extends ReactContextBaseJavaModule {

    PayooStarterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PayooStarter";
    }

    @ReactMethod
    void navigateToPaymentPayoo(ReadableMap map) {
        UserPaymentDTO paymentDTO = new UserPaymentDTO(map);
        Order payooOrderInfo = new Order(map);
        Intent intent = new Intent(this.getReactApplicationContext(), PayooActivity.class);
        intent.putExtra("Payment", paymentDTO);
        intent.putExtra("PayooOrderInfo", payooOrderInfo);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        this.getReactApplicationContext().startActivity(intent);
    }
}