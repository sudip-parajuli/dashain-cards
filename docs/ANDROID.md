# Android development

The app is a native Java WebView host, with an offline copy of the web frontend. `web/` is the source of truth; `android/app/src/main/assets/public/` is generated and ignored.

## Debug APK on Windows

Install JDK 17 and Android SDK platform 35 / build-tools 35.0.0 for the direct packaging script. Pass absolute local paths:

```powershell
npm run build
./scripts/build-debug-apk.ps1 -JdkPath 'C:/path/to/jdk-17' -SdkPath 'C:/path/to/Android/Sdk'
./tests/apk-layout.ps1
```

The script creates a debug signing key in the ignored build directory and writes `release/DashainCards-debug.apk`. The conventional debug password in the script is for disposable debug signing only; it is not a production credential. Preserve the existing local debug key if you want an APK to update an installed debug build without uninstalling it.

The APK verifier checks normalized Android asset paths, startup assets and exact source hashes. It does not replace device testing.

## Android Studio / Gradle

The checked-in Gradle project targets SDK 36; install that platform to use the Gradle configuration. No Gradle wrapper binary is included. Open `android/` in Android Studio or use a compatible installed Gradle, and regenerate web assets before building. The direct debug script uses SDK 35's tools/platform jar with target 36 metadata; release toolchains should use the matching current SDK.

## Play Store preparation

The debug APK is not a Play Store artifact. Before publishing, create a Play developer account, configure secure release/upload signing, produce a release AAB, and complete the store listing, privacy/data declarations, content rating and required testing. Keep signing keys and passwords in a password manager or protected CI secret store, never in Git.

Test rotation, cold/offline startup, app resume, import/export, drag and tap controls, shared-link joining and slow/disconnected multiplayer on physical devices before release.

Audio release checks: verify music/effects volume and mute on a physical phone, then background/foreground the app and interrupt it with a file picker or another app. The native host dispatches pause/resume events to the audio engine as well as pausing/resuming its WebView.
