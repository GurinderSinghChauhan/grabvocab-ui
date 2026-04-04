import { ApiError, handleApiError } from '../errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError('NOT_FOUND', 'Resource not found', 404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(404);
    });
  });

  describe('handleApiError', () => {
    it('should return ApiError if error is already ApiError', () => {
      const originalError = new ApiError('TEST_ERROR', 'Test message', 500);
      const result = handleApiError(originalError);
      expect(result).toBe(originalError);
    });

    it('should convert Error to ApiError', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);
      expect(result).toBeInstanceOf(ApiError);
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });
});
