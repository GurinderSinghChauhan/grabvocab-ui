# Security & Environment Configuration Guide

## Environment Variables

This project uses Expo's public environment variables for configuration. All sensitive secrets must be managed through GitHub Secrets.

### Local Development Setup

1. **Copy example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your local values to `.env`:**
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://your-api.com
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   ```

3. **Local-only secrets (never commit):**
   ```bash
   # .env.local - contains deployment tokens
   VERCEL_OIDC_TOKEN=...
   ```

### Files Management

| File | Tracked | Purpose | Contains |
|------|---------|---------|----------|
| `.env.example` | ✅ YES | Template | Example values only |
| `.env` | ❌ NO | Local config | Development values |
| `.env.local` | ❌ NO | Local secrets | Deployment tokens |
| `.env*.local` | ❌ NO | Local machines | Machine-specific values |

### GitHub Secrets (CI/CD)

GitHub Actions requires secrets to be configured for deployments:

1. Go to: `Settings → Secrets and variables → Actions`

2. Add these secrets:
   ```
   VERCEL_TOKEN          # For Vercel deployments
   EXPO_PUBLIC_API_BASE_URL
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
   ```

3. Reference in GitHub Actions:
   ```yaml
   - name: Deploy
     env:
       VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
   ```

### Security Audit Results

✅ **All Clear**

- Only `.env.example` tracked in git
- Actual `.env` files are in `.gitignore`
- Local `.env.local` contains only deployment tokens
- No exposed API keys or secrets in repository

### Best Practices

1. ✅ **Never commit `.env` files**
2. ✅ **Use `.env.example` as template**
3. ✅ **Store secrets in GitHub Secrets**
4. ✅ **Rotate tokens regularly**
5. ✅ **Audit git history for accidental commits:**
   ```bash
   git log --all --full-history -- ".env"
   ```

### Verifying Setup

Run this to verify environment validation works:

```bash
npm run type-check  # Validates env config
```

The app will fail fast at startup if required variables are missing.
