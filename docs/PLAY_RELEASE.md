# Play release preparation — 29 October 2026

Package: `com.dashaincards.app`. Current version 1.7.0, version code 34. Android 8+ (min SDK 26), compile/target SDK 36. The first internal release was published on 29 October 2026 and Play Console reports it active and available to internal testers. Tester membership is managed in Play Console. Public production is not enabled yet. This personal account requires a closed test with at least 12 continuously opted-in testers for 14 days before applying for production access.

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

## Published internal release

Join link: https://play.google.com/apps/internaltest/4701334246091521663. Only approved tester accounts can opt in. Google may temporarily display `com.dashaincards.app (unreviewed)` until app setup and review are complete. Distribution may take up to an hour or occasionally longer to propagate. This is an internal rollout, not approval for public production.

Uploaded AAB SHA-256: `91e7d3788c19a4eee8b34fcc4ed3b73cd6e39d56f04097cb056093b0adc617e7`. Play accepted version code 33 / version 1.6.1 with no blocking errors. Its remaining optional warning is a missing deobfuscation file; this build does not minify or obfuscate.

## Version 1.7.0 update

Code 34 adds shuffle/distribution animations and winner celebrations with sound to all seven games, centred Jutpatti stock/indicator presentation, Faras hand-area controls and staged Kitti reveals. The 164-test suite and actual local workerd/WebSocket checks passed, including hidden-set privacy and settlement after the third showing. The deployed service passed a disposable two-player Kitti smoke test. Release lint has zero errors, bundletool validates the AAB, and recursive APK asset hashes match source. New Kitti rooms should use updated clients on every device.

Version 1.7.0 AAB SHA-256: `75018ac805c0be2cc0a4603804675fd7967e60022b9cd74e9907807cffeac65a`.

Play Console confirmed version 1.7.0 active and available to internal testers on 29 October 2026. The same internal opt-in link and tester list continue to apply. The only Play warning is the optional deobfuscation file for this unminified build. Physical-device feedback remains part of the internal test.
