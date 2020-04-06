package com.boot.market.payoo;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Build;
import android.preference.PreferenceManager;
import android.text.TextUtils;

import java.util.Locale;

public class LocaleHelper {

  private static final String SELECTED_COUNTRY = "key_selected_region";

  private static final String SELECTED_LANGUAGE = "key_selected_language";

  public static Locale getLocale(Context context) {
    return getPersistedLocale(context, Locale.getDefault());
  }

  public static Locale getLocale(Context context, Locale defaultLocale) {
    return getPersistedLocale(context, defaultLocale);
  }

  public static Context onAttach(Context context, Locale locale) {
    Locale lang = getPersistedLocale(context, locale);
    return setLocale(context, lang);
  }

  public static Context onAttach(Context context) {
    Locale locale = getPersistedLocale(context, Locale.getDefault());
    return setLocale(context, locale);
  }

  public static Context setLocale(Context context, Locale locale) {
    persist(context, locale);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      return updateResources(context, locale);
    }

    return updateResourcesLegacy(context, locale);
  }

  public static Context setLocale(Context context, String language, String country) {
    persist(context, language, country);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      return updateResources(context, language, country);
    }

    return updateResourcesLegacy(context, language, country);
  }

  public static Context setLocale(Context context, String language) {
    persist(context, language);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      return updateResources(context, language);
    }

    return updateResourcesLegacy(context, language);
  }

  private static String getPersistedLanguage(Context context, String defaultLanguage) {
    return PreferenceManager.getDefaultSharedPreferences(context).getString(SELECTED_LANGUAGE, defaultLanguage);
  }

  private static Locale getPersistedLocale(Context context, Locale defaultLocale) {
    String language = getPersistedLanguage(context, defaultLocale.getLanguage());
    String country = getPersistedRegion(context, defaultLocale.getCountry());
    return (TextUtils.isEmpty(language) || TextUtils.isEmpty(country)) ? defaultLocale : new Locale(language, country);
  }

  private static String getPersistedRegion(Context context, String defaultCountry) {
    return PreferenceManager.getDefaultSharedPreferences(context).getString(SELECTED_COUNTRY, defaultCountry);
  }

  private static void persist(Context context, String language, String region) {
    PreferenceManager.getDefaultSharedPreferences(context)
        .edit()
        .putString(SELECTED_LANGUAGE, language)
        .putString(SELECTED_COUNTRY, region)
        .apply();
  }

  private static void persist(Context context, Locale locale) {
    persist(context, locale.getLanguage(), locale.getCountry());
  }

  private static void persist(Context context, String language) {
    persist(context, language, "");
  }


  @TargetApi(Build.VERSION_CODES.N)
  private static Context updateResources(Context context, String language, String country) {
    return updateResources(context, new Locale(language, country));
  }

  @TargetApi(Build.VERSION_CODES.N)
  private static Context updateResources(Context context, Locale locale) {
    Locale.setDefault(locale);

    Configuration configuration = context.getResources().getConfiguration();
    configuration.setLocale(locale);
    configuration.setLayoutDirection(locale);

    return context.createConfigurationContext(configuration);
  }

  @TargetApi(Build.VERSION_CODES.N)
  private static Context updateResources(Context context, String language) {
    return updateResources(context, new Locale(language));
  }

  @SuppressWarnings("deprecation")
  private static Context updateResourcesLegacy(Context context, String language, String country) {
    return updateResourcesLegacy(context, new Locale(language, country));
  }

  @SuppressWarnings("deprecation")
  private static Context updateResourcesLegacy(Context context, String language) {
    return updateResourcesLegacy(context, new Locale(language));
  }

  @SuppressWarnings("deprecation")
  private static Context updateResourcesLegacy(Context context, Locale locale) {
    Locale.setDefault(locale);

    Resources resources = context.getResources();

    Configuration configuration = resources.getConfiguration();
    configuration.locale = locale;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
      configuration.setLayoutDirection(locale);
    }

    resources.updateConfiguration(configuration, resources.getDisplayMetrics());

    return context;
  }
}