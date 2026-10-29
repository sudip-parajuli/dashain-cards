# Play release preparation — 29 October 2026

Package: `com.dashaincards.app`. Version 1.6.1, version code 33. Android 8+ (min SDK 26), compile/target SDK 36. The first Play milestone is internal testing; public production is not enabled yet. This personal account requires a closed test with at least 12 continuously opted-in testers for 14 days before applying for production access.

## Build and verification

Use JDK 17, Gradle 9.6.0, AGP 9.4.0, Android platform 36 and build-tools 36.0.0. Tool binaries and SDK installations stay outside source control. `scripts/build-release.ps1` accepts their paths and a protected signing directory outside the source checkout:

```powershell
./scripts/build-release.ps1 -JdkPath 'C:/tools/jdk-17' -SdkPath 'C:/tools/android-sdk' -GradlePath 'C:/tools/gradle-9.6.0/bin/gradle.bat' -SigningDirectory 'C:/private/dashain-signing'
./tests/apk-layout.ps1 -ApkPath release/DashainCards-release.apk
java -jar C:/tools/bundletool-all.jar validate --bundle=release/DashainCards-release.aab
```

The signing directory contains `dashain-upload.jks` and `upload-password.txt`; the alias is `dashain-upload`. Preserve an encrypted offline backup of both. The script reads the password locally into process environment variables, clears them afterward, and never puts it in command arguments or Git. Google Play App Signing manages the distribution signing key; the local key signs uploads. Never commit keys, passwords or built artifacts.

Release outputs: `release/DashainCards-release.aab` and `release/DashainCards-release.apk`. The debug APK is not the submission artifact. Play re-signs delivered APKs, so the Play build cannot update an installed debug APK in place. Test using another device/profile first; uninstalling the debug app removes its device-local coins and credentials. Exported score backups do not preserve the wallet or private room credentials.

Verified: release compilation/signatures, Google bundletool validation, exact recursive asset hashes, and Android lint with zero errors. Five nonblocking lint warnings remain: API 37 is newer than the chosen supported API 36, the API-33 back-callback attribute is ignored on older devices, orientation preferences may be ignored on large Android-16 displays, and JavaScript is intentionally enabled for the bundled game. API 33+ uses the native back dispatcher; API 26–32 retains the legacy callback. Automatic cloud backup and device transfer are explicitly excluded, including local seat credentials. Release cleartext traffic and debugging are disabled.

No physical Android device was connected during release preparation. Internal testers must check cold/offline startup, audio and interruptions, portrait/landscape, drag/tap controls, all seven games, scoring, deep/share links, network changes and multiplayer reconnects. Review Play's pre-launch report before advancing to closed testing.

## Console declarations and listing

The owner authorized Play App Signing terms, policy/export declarations and confirmed distribution rights for The_Auspicious_Call.mp3 on 29 October 2026. The game is free; coins are virtual with no purchase, cash-out or real-money wagering.

Before a closed/public release, finish the store listing and app-content forms: privacy policy, Data Safety, ads (none currently), app access, audience and IARC content rating. Answer simulated-gambling questions accurately for Faras. Disclose optional online names, gameplay and shared scores consistent with the policy; do not simply claim no collection because offline play is available. Public policy: https://www.techwiredsolutions.com.np/dashaincards/privacy.html. Support: hello@techwiredsolutions.com.np.

Internal testing does not satisfy the required closed-test period. The developer must recruit and retain the closed testers and keep feedback records; opting in and actual device use cannot be automated on their behalf. Free-tier backend limits are documented in CAPACITY.md and still apply.
