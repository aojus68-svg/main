# Shipping ASCEND to the app stores

This project is wrapped with [Capacitor](https://capacitorjs.com), which packages the web app as
native Android and iOS apps. Nothing has been built or submitted yet. Publishing needs your own
developer accounts, signing keys and a review by each store, which cannot be done on your behalf.

## 0. Before you start
- Change `appId` in `capacitor.config.json` to a reverse-domain ID you own (for example `com.yourname.ascend`). It cannot be changed after release.
- Add app icons and a splash screen (`npx @capacitor/assets generate`).
- Write a privacy policy and host it at a public URL. All three stores ask for it.
- Keep the in-app notices: the app is not medical advice, and it has a PAR-Q style safety check and a minimum calorie target.
- Do not add an AI coach key to the app itself. Keep it on a server (see `server/coach.js`).

## 1. Build the native projects
```
npm install
npm run build
npm run cap:add:android      # once
npm run cap:add:ios          # once, macOS only
npm run cap:sync             # after every web change
```

## 2. Google Play (Android)
1. Create a Google Play Console account (one-time fee).
2. `npm run cap:android` opens Android Studio. Build a signed **App Bundle (.aab)** (Build > Generate Signed Bundle).
3. Upload it to a new app in Play Console. Fill in the store listing, content rating, data safety form and privacy policy.
4. New personal accounts must run a closed test with testers before production release.

## 3. Apple App Store (iOS)
1. Join the Apple Developer Program (yearly fee). You need a Mac with Xcode.
2. `npm run cap:ios` opens Xcode. Set your Team and bundle ID, then Product > Archive.
3. Upload through Xcode Organizer to App Store Connect. Add screenshots, description, privacy details and a privacy policy URL.
4. Apple rejects apps that are only a website in a wrapper (guideline 4.2). Add native features before submitting, for example local notifications (`@capacitor/local-notifications`) for quest reminders, haptics, and a real barcode scanner (`@capacitor-mlkit/barcode-scanning`).
5. Health and fitness apps get extra scrutiny. Keep the disclaimers and avoid medical claims.

## 4. Huawei AppGallery
1. Register a Huawei Developer account and complete identity verification.
2. Build a signed **APK or AAB** from the same Android project. Huawei phones without Google services can run it, but do not depend on Google services (Play Services, Firebase) in the app.
3. Create the app in AppGallery Connect, upload the package, and complete the listing and privacy details.
4. For distribution in mainland China you will also need an ICP filing and, for some categories, a software copyright certificate. Check Huawei's current requirements.

## 5. After release
- Update the `STORE_LINKS` values in the web app so the "Get the app" buttons point to your listings.
- Re-run `npm run cap:sync` and upload a new build for each update.
