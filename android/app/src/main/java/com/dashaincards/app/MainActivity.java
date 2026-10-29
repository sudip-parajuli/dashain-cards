package com.dashaincards.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private WebView web;
    private boolean tableActive;
    private ValueCallback<Uri[]> chooser;
    private String exportText;
    private volatile String roomServer = "";
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        roomServer = getPreferences(MODE_PRIVATE).getString("roomServer", "");
        web = new WebView(this);
        android.widget.FrameLayout container = new android.widget.FrameLayout(this);
        container.addView(web, new android.widget.FrameLayout.LayoutParams(-1, -1));
        setContentView(container);
        container.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.displayCutout());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else { v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom()); }
            return insets;
        });
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(true);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) WebView.setWebContentsDebuggingEnabled(true);
        web.addJavascriptInterface(new ExportBridge(), "DashainNative");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!roomServer.isEmpty() && uri.toString().startsWith(roomServer + "/api/")) return null;
                if (!"https".equals(uri.getScheme()) || !"appassets.androidplatform.net".equals(uri.getHost())) {
                    return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
                }
                String path = uri.getPath();
                if (path == null || !path.startsWith("/assets/public/") || path.contains("..")) return null;
                try {
                    String asset = path.substring("/assets/".length());
                    String mime = asset.endsWith(".js") ? "text/javascript" : asset.endsWith(".css") ? "text/css" : asset.endsWith(".svg") ? "image/svg+xml" : asset.endsWith(".json") ? "application/json" : "text/html";
                    return new WebResourceResponse(mime, "UTF-8", getAssets().open(asset));
                } catch (IOException e) {
                    android.util.Log.e("DashainCards", "Missing bundled asset: " + path, e);
                    if (path.endsWith("index.html")) runOnUiThread(() -> showLoadError("The bundled app screen is missing. Please install the latest Dashain Cards APK."));
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), new ByteArrayInputStream("Bundled asset missing".getBytes(StandardCharsets.UTF_8)));
                }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if ("https".equals(u.getScheme()) && "appassets.androidplatform.net".equals(u.getHost())) return false;
                if ("https".equals(u.getScheme())) { try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {} }
                if ("mailto".equals(u.getScheme())) { try { startActivity(new Intent(Intent.ACTION_SENDTO, u)); } catch (Exception ignored) {} }
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showLoadError("Could not open the app: " + error.getDescription());
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                android.util.Log.println(message.messageLevel() == ConsoleMessage.MessageLevel.ERROR ? android.util.Log.ERROR : android.util.Log.INFO, "DashainCards", message.message() + " at " + message.sourceId() + ":" + message.lineNumber());
                return true;
            }
            @Override public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("Continue", (d,w) -> result.confirm()).setNegativeButton("Cancel", (d,w) -> result.cancel()).setOnCancelListener(d -> result.cancel()).show();
                return true;
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (chooser != null) chooser.onReceiveValue(null);
                chooser = callback;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json");
                try { startActivityForResult(i, 1); } catch (Exception e) { chooser.onReceiveValue(null); chooser = null; }
                return true;
            }
        });
        web.loadUrl(ORIGIN + "/assets/public/index.html");
    }
    private void showLoadError(String message) {
        if (!isFinishing()) new AlertDialog.Builder(this).setTitle("Dashain Cards could not start").setMessage(message).setPositiveButton("Retry", (d,w) -> web.reload()).setNegativeButton("Close", (d,w) -> finish()).show();
    }
    private void updateTableBars() {
        boolean immersive = tableActive && getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE;
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            android.view.WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                if (immersive) controller.hide(android.view.WindowInsets.Type.systemBars());
                else controller.show(android.view.WindowInsets.Type.systemBars());
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(immersive ? View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION : View.SYSTEM_UI_FLAG_VISIBLE);
        }
    }
    @Override public void onConfigurationChanged(android.content.res.Configuration configuration) {
        super.onConfigurationChanged(configuration);
        updateTableBars();
    }
    public class ExportBridge {
        @JavascriptInterface public void setTableActive(boolean active) {
            runOnUiThread(() -> { if (tableActive != active) { tableActive = active; updateTableBars(); } });
        }

        @JavascriptInterface public void resetTableRotation() {
            runOnUiThread(() -> setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_FULL_USER));
        }

        @JavascriptInterface public void rotateTable() {
            runOnUiThread(() -> {
                boolean landscape = getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE;
                setRequestedOrientation(landscape ? android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT : android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            });
        }

        @JavascriptInterface public boolean shareScores(String value) {
            Uri u = Uri.parse(value);
            if (!"https".equals(u.getScheme()) || !"www.techwiredsolutions.com.np".equals(u.getHost()) || !"/dashaincards".equals(u.getPath()) || u.getUserInfo() != null || u.getQuery() != null || u.getPort() != -1 || u.getFragment() == null || !u.getFragment().matches("scores=[0-9]{6}")) return false;
            runOnUiThread(() -> {
                Intent share = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, "Follow our Dashain Cards live scores: " + value);
                try { startActivity(Intent.createChooser(share, "Share live scores")); } catch (Exception ignored) {}
            });
            return true;
        }

        @JavascriptInterface public boolean setRoomServer(String value) {
            Uri u = Uri.parse(value);
            String host = u.getHost();
            if (host == null || u.getUserInfo() != null || u.getQuery() != null || u.getFragment() != null || !(value.equals(u.getScheme() + "://" + u.getEncodedAuthority()) || value.equals(u.getScheme() + "://" + u.getEncodedAuthority() + "/dashaincards"))) return false;
            boolean local = host.equals("localhost") || host.equals("127.0.0.1") || host.matches("10\\.\\d+\\.\\d+\\.\\d+") || host.matches("192\\.168\\.\\d+\\.\\d+") || host.matches("172\\.(1[6-9]|2\\d|3[01])\\.\\d+\\.\\d+");
            if (!("https".equals(u.getScheme()) || ("http".equals(u.getScheme()) && local))) return false;
            roomServer = value;
            getPreferences(MODE_PRIVATE).edit().putString("roomServer", value).apply();
            return true;
        }
        @JavascriptInterface public void saveFile(String name, String content, String mime) {
            if (content.length() > 5000000 || !(mime.equals("application/json") || mime.equals("text/csv"))) return;
            runOnUiThread(() -> {
                if (exportText != null) return;
                exportText = content;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime).putExtra(Intent.EXTRA_TITLE, name.replaceAll("[^a-zA-Z0-9._-]", "_"));
                try { startActivityForResult(i, 2); } catch (Exception e) { exportText = null; }
            });
        }
    }
    @Override protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == 1 && chooser != null) { chooser.onReceiveValue(result == RESULT_OK && data != null ? new Uri[]{data.getData()} : null); chooser = null; }
        if (code == 2 && exportText != null) {
            if (result == RESULT_OK && data != null) try (OutputStream out = getContentResolver().openOutputStream(data.getData())) { out.write(exportText.getBytes(StandardCharsets.UTF_8)); } catch (IOException e) { new AlertDialog.Builder(this).setMessage("Could not save the backup. Please try again.").setPositiveButton("OK",null).show(); }
            exportText = null;
        }
    }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else new AlertDialog.Builder(this).setMessage("Close Dashain Cards? Your games and scores are saved.").setPositiveButton("Close",(d,w)->finish()).setNegativeButton("Stay",null).show(); }
    @Override protected void onPause() {
        if (web != null) { web.evaluateJavascript("document.dispatchEvent(new Event('dashainpause'))", null); web.onPause(); }
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        updateTableBars();
        if (web != null) { web.onResume(); web.evaluateJavascript("document.dispatchEvent(new Event('dashainresume'))", null); }
    }
    @Override protected void onDestroy() { web.removeJavascriptInterface("DashainNative"); web.destroy(); super.onDestroy(); }
}

