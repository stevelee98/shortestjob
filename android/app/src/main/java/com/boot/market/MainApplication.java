package com.boot.market;

import android.annotation.SuppressLint;
import android.app.Application;
import android.content.Context;
import android.os.AsyncTask;
import android.os.Handler;

import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.react.ReactApplication;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import br.com.dopaminamob.gpsstate.GPSStatePackage;
import io.rumors.reactnativesettings.RNSettingsPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import cl.json.RNSharePackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.soloader.SoLoader;
import com.imagepicker.ImagePickerPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;

import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import android.content.IntentFilter;
import org.devio.rn.splashscreen.SplashScreenReactPackage;

import androidx.multidex.MultiDex;

import io.rumors.reactnativesettings.receivers.GpsLocationReceiver;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

import co.apptailor.googlesignin.RNGoogleSigninPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // <-- Add this line
import io.invertase.firebase.storage.RNFirebaseStoragePackage; // <-- Add this line
import com.facebook.appevents.AppEventsLogger;

import org.opencv.android.CameraBridgeViewBase;
import org.opencv.android.JavaCameraView;
import com.vydia.RNUploader.UploaderReactPackage;

import io.invertase.firebase.auth.RNFirebaseAuthPackage; // <-- Add this line

public class MainApplication extends Application implements ReactApplication {

  public static String CASCADE_SQUARE_FILE = "";
  public static String CHARS_FILE = "";
  public static String DIGIT_FILE = "";
  public static CameraBridgeViewBase CAMERA;

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @SuppressLint("MissingPermission")
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ImageResizerPackage(),
            new SplashScreenReactPackage(),
            new VectorIconsPackage(),
            // new RNGRPPackage(),      
            new GPSStatePackage(),
            new MapsPackage(),
            new RNSettingsPackage(),
            new RNGestureHandlerPackage(),
            new RNDeviceInfo(),
            new UploaderReactPackage(),
            new RNSharePackage(),
            new RNVersionNumberPackage(),
            new ReactNativeRestartPackage(),
            new RNFirebasePackage(),
            new PickerPackage(),
            new FBSDKPackage(mCallbackManager),
            new FastImageViewPackage(),
            new RNGoogleSigninPackage(),
            new ImagePickerPackage(),
            new RNI18nPackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseCrashlyticsPackage(),
            new RNFirebaseDatabasePackage(),
            new RNFirebaseStoragePackage(), // <-- Add this line
            new ActivityStarterReactPackage(),
            new RNFirebaseAuthPackage() // <-- Add this line
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    FacebookSdk.setApplicationId("322485702018154");
    FacebookSdk.sdkInitialize(this);
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    AppEventsLogger.activateApp(this);
    registerReceiver(new GpsLocationReceiver(), new IntentFilter("android.location.PROVIDERS_CHANGED"));
  }

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    MultiDex.install(this);
  }
}
