export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'https://dictionary-backend-six.vercel.app';

/**
 * Represents a word definition from the backend API.
 */
export type BackendWord = {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  pronunciation?: string;
  wordForms?: string[];
  exampleSentence?: string;
  synonyms?: string[];
  antonyms?: string[];
  memoryTrick?: string;
  origin?: string;
  imageURL?: string;
};

/**
 * Makes a typed API request to the backend.
 *
 * @template T - The response type
 * @param path - API endpoint path
 * @param init - Optional fetch configuration
 * @returns The typed response from the API
 * @throws Error if the API returns an error status
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }

  return data as T;
}

type AuthUser = { id: string; username: string; email: string; isAdmin?: boolean };

/**
 * API client for interacting with the GrabVocab backend.
 * Provides methods for dictionary lookups, authentication, and content browsing.
 */
export const api = {
  /**
   * Fetches the word of the day.
   *
   * @returns Promise with word, meaning, and date
   */
  wordOfDay: () => request<{ word: string; meaning: string; date: string }>('/wordoftheday'),

  /**
   * Gets the definition of a specific word.
   *
   * @param word - The word to look up
   * @returns Promise with term and detailed result
   */
  define: (word: string) =>
    request<{ term: string; result: BackendWord }>(`/define/${encodeURIComponent(word)}`),

  /**
   * Searches the word dictionary with pagination.
   *
   * @param page - Page number (default: 1)
   * @param limit - Results per page (default: 10)
   * @param search - Search query string
   * @returns Promise with paginated results
   */
  dictionary: (page = 1, limit = 10, search = '') =>
    request<{ words: BackendWord[]; totalPages: number; total: number; page: number }>(
      `/words?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    ),
  subject: (subject: string, page = 1, limit = 10) =>
    request<{ words: BackendWord[]; totalPages: number; page: number; totalWords: number }>(
      `/subject/${encodeURIComponent(subject)}?page=${page}&limit=${limit}`
    ),
  grade: (grade: string, page = 1, limit = 10) =>
    request<{ words: BackendWord[]; totalPages: number; page: number; totalWords: number }>(
      `/grade?grade=${encodeURIComponent(grade)}&page=${page}&limit=${limit}`
    ),
  exam: (exam: string, page = 1, limit = 10) =>
    request<{ words: BackendWord[]; totalPages: number; page: number; totalWords: number }>(
      `/exam?exam=${encodeURIComponent(exam)}&page=${page}&limit=${limit}`
    ),
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, password }),
    }),
  register: (username: string, email: string, password: string) =>
    request<{ token: string; message: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  googleLogin: (idToken: string) =>
    request<{ token: string; user: AuthUser }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  me: (token: string) =>
    request<{ user: AuthUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
