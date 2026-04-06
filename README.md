# GrabVocab UI

Standalone Expo frontend for GrabVocab. This repo contains the cross-platform UI for web, iOS, and Android and connects to the separate Express backend in `dictiionery-backend`.

## Requirements

- Node.js 20+
- npm
- Running backend at `/Users/anurag/gschauhan/dictiionery-backend`

## Setup

```bash
npm install
cp .env.example .env
```

Set these variables in `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://dictionary-backend-six.vercel.app
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

For local backend development, override `EXPO_PUBLIC_API_BASE_URL` with your local server URL.

Google login stays wired in the app, but it will only work after the Google client IDs are configured here and in the backend env.

## Run

```bash
npm run web
```

```bash
npm run ios
```

```bash
npm run android
```

## Backend Contract

This app expects the backend to provide:

- `/wordoftheday`
- `/define/:word`
- `/words`
- `/subject`
- `/grade`
- `/exam`
- `/auth/login`
- `/auth/register`
- `/auth/google`
- `/auth/me`

## Validation

```bash
npx tsc --noEmit
npx expo export --platform web
```

## Mobile Release Artifacts

GitHub Actions can now build mobile artifacts and attach them to a GitHub Release through
`.github/workflows/mobile-release.yml`.

- Android output: `grabvocab-android-debug-<tag>.apk`
- iOS output: `grabvocab-ios-simulator-<tag>.zip`

The workflow runs when:

- you push to `main` and the workflow creates a release tag automatically
- you publish a GitHub Release
- you trigger the `Mobile Release Artifacts` workflow manually and provide a tag

Automatic tags created on `main` pushes use this format:

- `v<package-version>-build.<github-run-number>`

Notes:

- The Android artifact is a CI-built debug APK suitable for direct download and testing.
- The iOS artifact is a simulator `.app` bundled as a zip because unsigned device `.ipa` builds
  require Apple signing credentials.
