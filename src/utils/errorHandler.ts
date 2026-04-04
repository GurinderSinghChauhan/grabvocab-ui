/**
 * Custom API error class with status codes and error codes.
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Converts unknown errors to ApiError instances for consistent error handling.
 *
 * @param error - Any error type
 * @returns Normalized ApiError instance
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    console.error('API Error:', error.message);
    return new ApiError('UNKNOWN_ERROR', error.message);
  }

  console.error('Unexpected error:', error);
  return new ApiError('UNKNOWN_ERROR', 'An unexpected error occurred');
};

/**
 * Logs an error with optional context for debugging.
 *
 * @param error - The error to log
 * @param context - Optional context string to include in the log
 */
export const logError = (error: unknown, context?: string): void => {
  const prefix = context ? `[${context}]` : '[Error]';
  if (error instanceof Error) {
    console.error(`${prefix}:`, error.message, error.stack);
  } else {
    console.error(`${prefix}:`, error);
  }
};
