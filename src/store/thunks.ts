import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/api';
import { normalizeWord } from '../utils/normalizeWord';
import type { RouteState } from '../types/app';

/**
 * Async thunk for fetching search suggestions
 * Fetches from Datamuse API based on search query
 */
export const loadSuggestions = createAsyncThunk('ui/loadSuggestions', async (query: string) => {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.datamuse.com/sug?s=${encodeURIComponent(query.trim())}`
    );
    const data = (await response.json()) as Array<{ word: string }>;
    return data.slice(0, 5).map((item) => item.word);
  } catch {
    return [];
  }
});

/**
 * Async thunk for fetching words based on route
 * Handles multiple route types: word, dictionary, subject, grade, exam
 */
export const loadRouteData = createAsyncThunk('words/loadRouteData', async (route: RouteState) => {
  // Pages that don't need data loading
  if (
    route.page === 'home' ||
    route.page === 'about' ||
    route.page === 'share' ||
    route.page === 'quiz' ||
    route.page === 'auth'
  ) {
    return null;
  }

  try {
    if (route.page === 'word') {
      const data = await api.define(route.word);
      return {
        type: 'currentWord' as const,
        data: normalizeWord(data.result),
      };
    }

    if (route.page === 'dictionary') {
      const data = await api.dictionary(1, 50, '');
      return {
        type: 'collectionWords' as const,
        data: data.words.map(normalizeWord),
      };
    }

    if (route.page === 'subject') {
      const data = await api.subject(route.value, 1, 50);
      return {
        type: 'collectionWords' as const,
        data: data.words.map(normalizeWord),
      };
    }

    if (route.page === 'grade') {
      const data = await api.grade(route.value, 1, 50);
      return {
        type: 'collectionWords' as const,
        data: data.words.map(normalizeWord),
      };
    }

    if (route.page === 'exam') {
      const data = await api.exam(route.value, 1, 50);
      return {
        type: 'collectionWords' as const,
        data: data.words.map(normalizeWord),
      };
    }

    return null;
  } catch (error: unknown) {
    throw error instanceof Error ? error.message : 'Backend unavailable';
  }
});
