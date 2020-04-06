package com.boot.market.enumeration;

import android.annotation.SuppressLint;
import android.os.Parcel;
import android.os.Parcelable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import androidx.annotation.DrawableRes;
import androidx.annotation.Keep;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StringRes;
import vn.payoo.paymentsdk.data.model.Bank;
import vn.payoo.paymentsdk.R.drawable;
import vn.payoo.paymentsdk.R.string;

@Keep
public enum PaymentMethod implements Parcelable {

    @SuppressLint("ResourceType") DOMESTIC_CARD(drawable.ic_payment_domestic, string.payment_method_domestic_card, 2, 0),
    @SuppressLint("ResourceType") INTERNATIONAL_CARD(drawable.ic_payment_credit, string.payment_method_international_card, 4, 1),
    @SuppressLint("ResourceType") PAY_AT_STORE(drawable.ic_payment_store, string.payment_method_pay_at_store, 8, 2),
    @SuppressLint("ResourceType") E_WALLET(drawable.ic_payment_wallet, string.payment_method_ewallet, 1, 3);

    public static final Creator<PaymentMethod> CREATOR = new Creator<PaymentMethod>() {
        @Override
        public PaymentMethod createFromParcel(Parcel source) {
            return null;
        }

        @Override
        public PaymentMethod[] newArray(int size) {
            return new PaymentMethod[0];
        }

        public PaymentMethod a(Parcel var1) {
            return PaymentMethod.values()[var1.readInt()];
        }

        public PaymentMethod[] a(int var1) {
            return new PaymentMethod[var1];
        }
    };
    public static final int TOKEN_TYPE = 4;
    private static final int TOKEN = 16;
    private final List<Bank> banks;
    @DrawableRes
    private final int drawableResId;
    @StringRes
    private final int stringResId;
    private final int type;
    private final int value;
    private boolean isInternal;
    private boolean isTokenSupported;

    @Nullable
    public static PaymentMethod from(int var0) {
        PaymentMethod[] var1 = values();
        int var2 = var1.length;

        for(int var3 = 0; var3 < var2; ++var3) {
           PaymentMethod var4 = var1[var3];
            if (var4.getType() == var0) {
                return var4;
            }
        }

        return null;
    }

    @NonNull
    public static List<PaymentMethod> get(int var0, @Nullable Integer var1) {
        ArrayList var2 = new ArrayList();
        PaymentMethod[] var3 = values();
        int var4 = var3.length;

        for(int var5 = 0; var5 < var4; ++var5) {
           PaymentMethod var6 = var3[var5];
            if ((var6.value & var0) != 0) {
                var6.isInternal = var1 != null && (var6.value & var1) != 0;
                var6.isTokenSupported = (var0 & 16) != 0;
                var2.add(var6);
            }
        }

        Collections.sort(var2, (Comparator<PaymentMethod>) (var11, var21) -> var11.getType() - var21.getType());
        return var2;
    }

    public static String getTrackingName(PaymentMethod var0) {
        String var1 = var0.name();
        String var2 = "";
        if (var1.equalsIgnoreCase(PAY_AT_STORE.name())) {
            var2 = "Pay at Store";
        } else if (var1.equalsIgnoreCase(DOMESTIC_CARD.name())) {
            var2 = "Domestic Card";
        } else if (var1.equalsIgnoreCase(INTERNATIONAL_CARD.name())) {
            var2 = "International Card";
        } else if (var1.equalsIgnoreCase(E_WALLET.name())) {
            var2 = "eWallet";
        }

        return var2;
    }

    private PaymentMethod(Parcel var3) {
        this.drawableResId = var3.readInt();
        this.stringResId = var3.readInt();
        this.type = var3.readInt();
        this.value = var3.readInt();
        this.isInternal = var3.readByte() != 0;
        this.banks = new ArrayList();
    }

    private PaymentMethod(int var3, int var4, @DrawableRes int var5, @StringRes int var6) {
        this.drawableResId = var3;
        this.stringResId = var4;
        this.value = var5;
        this.type = var6;
        this.banks = new ArrayList();
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel var1, int var2) {
        var1.writeInt(this.drawableResId);
        var1.writeInt(this.stringResId);
        var1.writeInt(this.type);
        var1.writeInt(this.value);
        var1.writeByte((byte)(this.isInternal ? 1 : 0));
    }

    public List<Bank> getBanks() {
        return this.banks;
    }

    public void setBanks(List<Bank> var1) {
        Collections.sort(var1, (var11, var2) -> {
            if (var11.getBankId() > var2.getBankId()) {
                return 1;
            } else {
                return var11.getBankId() < var2.getBankId() ? -1 : 0;
            }
        });
        this.banks.clear();
        this.banks.addAll(var1);
    }

    public int getDrawableResId() {
        return this.drawableResId;
    }

    public int getStringResId() {
        return this.stringResId;
    }

    public int getType() {
        return this.type;
    }

    public int getValue() {
        return this.value;
    }

    public boolean isInternal() {
        return this.isInternal;
    }

    public boolean isTokenSupported() {
        return this.isTokenSupported;
    }
}
