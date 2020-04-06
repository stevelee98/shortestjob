package com.boot.market.payoo;

import vn.payoo.paymentsdk.data.converter.OrderConverter;

public class PayooConverter implements OrderConverter {

  public static PayooConverter create() {
    return new PayooConverter();
  }

  @Override
  public <T> vn.payoo.paymentsdk.data.model.Order convert(T data) {
    Order response = Order.class.cast(data);
    return vn.payoo.paymentsdk.data.model.Order.newBuilder()
        .checksum(response.getChecksum())
        .orderInfo(response.getOrderInfo())
        .build();
  }
}