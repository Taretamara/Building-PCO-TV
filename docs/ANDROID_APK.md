# PCO TV — Android APK (test build v1.0)

## Install (easiest)
GitHub → Releases → **v1.0-apk** → download `pco-tv-1.0.apk` → send to the
phone → tap → allow **Install unknown apps** → Install. Opens your live PWA
fullscreen with the PCO TV icon.

## Rebuild locally
Source: `apps/android/` (WebView wrapper, no native code beyond one Activity).
Needs JDK 17 + Android SDK 34 + Gradle 8.10 (see commit history for setup).
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=$HOME/android-sdk
export PCO_STORE_PASSWORD=$(cat ~/.pco-android/store.pass)
export PCO_KEY_PASSWORD=$PCO_STORE_PASSWORD PCO_KEY_ALIAS=pco
~/gradle-8/gradle-8.10.2/bin/gradle -p apps/android assembleRelease
```
APK: `apps/android/app/build/outputs/apk/release/app-release.apk`.

## Keystore warning (important)
Signing key: `~/.pco-android/pco-release.keystore` — backed up NOWHERE else,
intentionally never committed. **Back it up** (encrypted USB/drive): every
future update must be signed with this same key or Android treats it as a
different app. Password: `~/.pco-android/store.pass` (chmod 600).
Play Store later needs this same keystore for the `.aab`.

## Alternative (no toolchain): PWABuilder

Wraps the live PWA (`https://bejewelled-semolina-f0a16d.netlify.app`) into an
installable APK (Trusted Web Activity). No Android Studio needed.

## Steps (on any computer)
1. Go to **pwabuilder.com** → paste the Netlify URL → **Start**.
2. Wait for the scorecard (PWA already passes: manifest, PNG icons, SW, HTTPS, offline).
3. Click **Package for Android** → keep defaults → **Download**.
   You get an `.apk` signed for testing (plus an `.aab` for Play Store later).
4. Send the APK to the phone (Drive, WhatsApp, USB) → tap it → allow
   **Install unknown apps** when asked → Install.

## Fullscreen polish (optional, later)
First install shows a small URL bar. To remove it:
1. PWABuilder shows a **signing fingerprint (SHA-256)** on the download page.
2. Add `apps/web/.well-known/assetlinks.json` with your package name + fingerprint:
   ```json
   [{"relation":["delegate_permission/common.handle_all_urls"],
     "target":{"namespace":"android_app","package_name":"tv.pco.app",
     "sha256_cert_fingerprints":["PASTE_FINGERPRINT"]}}]
   ```
3. Push → rebuild in PWABuilder → reinstall. Fullscreen, no URL bar.

## Play Store (later, $25 one-time)
Play Console account → create app → upload the `.aab` → listing + review.
TV note: Android TV distribution needs a TV-compatible build (Leanback) —
the phone APK is for phones/tablets; TV stays a separate track (Phase 7).
