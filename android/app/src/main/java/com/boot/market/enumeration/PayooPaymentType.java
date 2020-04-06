package com.boot.market.enumeration;

import java.util.HashMap;
import java.util.Map;

public enum PayooPaymentType {

    E_WALLET(0),
    PAY_AT_STORE(1),
    BANK_PAYMENT(4),
    CC_PAYMENT(2);

    private int value;
    private static Map<Integer, PayooPaymentType> valueMapping = new HashMap<>();

    static {
        for (PayooPaymentType itemType : PayooPaymentType.values()) {
            valueMapping.put(itemType.getValue(), itemType);
        }
    }

    PayooPaymentType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public static PayooPaymentType parse(int value) {
        return valueMapping.get(value);
    }

}
