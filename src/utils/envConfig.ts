/**
 * Validates that all required environment variables are present and non-empty.
 *
 * @throws Error if any required environment variable is missing or empty
 */
export const validateEnvironment = (): void => {
  const requiredEnvVars = ['EXPO_PUBLIC_API_BASE_URL'];

  const missing: string[] = [];
  for (const key of requiredEnvVars) {
    if (!process.env[key] || process.env[key]?.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Gets the configured API base URL from environment or returns default.
 *
 * @returns The API base URL
 */
export const getApiBaseUrl = (): string => {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'https://dictionary-backend-six.vercel.app'
  );
};

/**
 * Gets Google OAuth client IDs for different platforms.
 *
 * @returns Object containing web, android, and ios client IDs
 */
export const getGoogleClientIds = () => ({
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
});
