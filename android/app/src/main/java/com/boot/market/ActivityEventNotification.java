package com.boot.market;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ActivityEventNotification extends ReactActivity {

    private Boolean isHave = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_event_notification);
        finish();
        // send param isHaveNewNotification to navigate screen notification in react native
        WritableMap params = Arguments.createMap();
        params.putBoolean("isHaveNewNotification", isHave = true);
        while (getReactInstanceManager().getCurrentReactContext() == null) ;  // Busy wait.
        getReactInstanceManager().getCurrentReactContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("isHaveNewNotification", params);
    }
}
