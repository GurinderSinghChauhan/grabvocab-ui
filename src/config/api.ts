export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://localhost:5000";

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

export const api = {
  wordOfDay: () => request<{ word: string; meaning: string; date: string }>('/wordoftheday'),
  define: (word: string) => request<{ term: string; result: BackendWord }>(`/define/${encodeURIComponent(word)}`),
  dictionary: (page = 1, limit = 10, search = '') =>
    request<{ wordsArray: BackendWord[]; totalPages: number; total: number; page: number }>(
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
    request<{ token: string; user: AuthUser }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ identifier: email, password }) }
    ),
  register: (username: string, email: string, password: string) =>
    request<{ token: string; message: string; user: AuthUser }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ username, email, password }) }
    ),
  googleLogin: (idToken: string) =>
    request<{ token: string; user: AuthUser }>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify({ idToken }) }
    ),
  me: (token: string) =>
    request<{ user: AuthUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
