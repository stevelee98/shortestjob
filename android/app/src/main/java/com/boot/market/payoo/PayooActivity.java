package com.boot.market.payoo;

import android.app.ProgressDialog;
import android.os.Bundle;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;

import com.boot.market.BuildConfig;
import com.boot.market.R;
import com.boot.market.dto.UserPaymentDTO;
import com.boot.market.enumeration.PaymentMethod;
import com.boot.market.enumeration.PayooPaymentType;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import vn.payoo.paymentsdk.OnPayooPaymentCompleteListener;
import vn.payoo.paymentsdk.PaymentConfig;
import vn.payoo.paymentsdk.PayooMerchant;
import vn.payoo.paymentsdk.PayooPaymentSDK;
import vn.payoo.paymentsdk.data.model.response.ResponseObject;
import vn.payoo.paymentsdk.data.model.type.GroupType;
//import vn.payoo.paymentsdk.data.model.type.PaymentMethod;

public class PayooActivity extends ReactActivity implements OnPayooPaymentCompleteListener {

    private PayooMerchant payooMerchant; //Payoo merchant
    private ProgressDialog progressDialog; //Progress dialog
    private UserPaymentDTO userPayment; //User payment
    private Order payooOrderInfo;
    private static final String KEY_AUTH_TOKEN = "app_auth_token";
    private static final String KEY_USER_ID = "user_id";
    private static int styleResId = R.style.PayooSdkTheme_Orange;
    //    private ImageView ivBack;
    private boolean isSuccessPayoo = false;
    private boolean isFirstLoad = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.layout_activity_payoo);
//        ivBack = findViewById(R.id.ivBack);
//        ivBack.setOnClickListener(v -> finish());
        this.userPayment = (UserPaymentDTO) getIntent().getSerializableExtra("Payment");
        this.payooOrderInfo = (Order) getIntent().getSerializableExtra("PayooOrderInfo");
        payooMerchant = PayooMerchant.newBuilder()
                .merchantId(getString(R.string.payoo_merchant_id))
                .secretKey(getString(R.string.payoo_secret_key))
                .isDevMode(!BuildConfig.FLAVOR.contains("production"))
                .converter(PayooConverter.create())
                .build();
        this.requestCreateOrder();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (isSuccessPayoo && !isFirstLoad) {
            Log.d("Oke", "Vao");
            new Handler().postDelayed(() -> finish(), 2000);
        }
    }

    /**
     * On success
     *
     * @param sampleOrderResponse
     */
    private void onSuccess(Order sampleOrderResponse) {
        String authToken =
                PreferenceManager.getDefaultSharedPreferences(getApplicationContext()).getString(KEY_AUTH_TOKEN,
                        null);
        PayooPaymentSDK.initialize(this, payooMerchant);
        List<PaymentMethod> paymentMethods = new ArrayList<>();
        if (PayooPaymentType.parse(this.userPayment.getGroupType()) == PayooPaymentType.PAY_AT_STORE) {
            paymentMethods.add(PaymentMethod.PAY_AT_STORE);
        } else if (PayooPaymentType.parse(this.userPayment.getGroupType()) == PayooPaymentType.BANK_PAYMENT) {
            paymentMethods.add(PaymentMethod.DOMESTIC_CARD);
        } else if (PayooPaymentType.parse(this.userPayment.getGroupType()) == PayooPaymentType.CC_PAYMENT) {
            paymentMethods.add(PaymentMethod.INTERNATIONAL_CARD);
        } else {
            paymentMethods.add(PaymentMethod.E_WALLET);
        }
        PaymentConfig paymentConfig = PaymentConfig.newBuilder()
                .withLocale(LocaleHelper.getLocale(getApplicationContext(), this.userPayment.getLang() ==
                        "vi_VN" ? PayooPaymentSDK.LOCALE_VI : PayooPaymentSDK.LOCALE_EN))
                .withCustomerEmail(this.userPayment.getEmail())
                .withCustomerPhone(this.userPayment.getPhone())
                .withUserId("" + this.userPayment.getUserId())
                .withAuthToken(authToken)
                .withStyleResId(styleResId)
//                .withSupportedPaymentMethods(paymentMethods)
                .withBankCode(this.userPayment.getBankCode())
                .build();
            PayooPaymentSDK.pay(this, sampleOrderResponse, paymentConfig);
        isSuccessPayoo = true;
        new Handler().postDelayed(() -> isFirstLoad = false, 2000);
    }

    /**
     * Hide progress dialog
     */
    public void hideProgressDialog() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
            progressDialog = null;
        }
    }

    /**
     * Show dialog
     */
    public void showProgressDialog() {
        if (progressDialog == null) {
            progressDialog = new ProgressDialog(this);
            progressDialog.setMessage(getString(R.string.msv_loading));
            progressDialog.setCancelable(false);
            progressDialog.setIndeterminate(true);
        }
        progressDialog.show();
    }

    @Override
    public void onPayooPaymentComplete(int groupType, @NonNull ResponseObject responseObject) {
        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        WritableMap params = Arguments.createMap();
        if (groupType == GroupType.SUCCESS) {
            if (responseObject.getData() != null) {
                String authToken = responseObject.getData().getAuthToken();
                if (!TextUtils.isEmpty(authToken)) {
                    PreferenceManager.getDefaultSharedPreferences(this).edit().putString(KEY_AUTH_TOKEN, authToken).apply();
                }

                params.putString("responsePayooComplete", responseObject.getData().toString());
                params.putInt("paymentPayooGroupType",
                        this.userPayment.getGroupType());
                while (mReactInstanceManager.getCurrentReactContext() == null) ;  // Busy wait.
                mReactInstanceManager.getCurrentReactContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("responsePayooComplete", params);
            }
        } else if (groupType == GroupType.FAILURE || groupType == GroupType.UNKNOWN) {
            params.putBoolean("responsePayooComplete", false);
            while (mReactInstanceManager.getCurrentReactContext() == null) ;  // Busy wait.
            mReactInstanceManager.getCurrentReactContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("responsePayooComplete", params);
        }
        finish();
    }

    /**
     * Client https
     */
    protected static OkHttpClient client = new OkHttpClient.Builder()
            .readTimeout(1, TimeUnit.MINUTES)
            .connectTimeout(1, TimeUnit.MINUTES)
            .writeTimeout(1, TimeUnit.MINUTES).addInterceptor(new Interceptor() {
                @Override
                public okhttp3.Response intercept(Chain chain) throws IOException {
                    Request.Builder ongoing = chain.request().newBuilder();
                    return chain.proceed(ongoing.build());
                }
            }).build();

    /**
     * Handle connect check sum
     */
    private void requestCreateOrder() {
        onSuccess(this.payooOrderInfo);
    }

    @Override
    public void onBackPressed() {
        finish();
    }
}
