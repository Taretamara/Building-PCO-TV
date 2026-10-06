# PCO TV — Android APK via PWABuilder (free)

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
