import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/api';
import { sampleWords } from '../data/sampleWords';
import { normalizeWord } from '../utils/normalizeWord';
import type { RouteState } from '../types/app';

function getLocalWord(word: string) {
  return sampleWords.find((entry) => entry.word.toLowerCase() === word.toLowerCase());
}

function getLocalCollection(route: Extract<RouteState, { page: 'subject' | 'grade' | 'exam' }>) {
  if (route.page === 'subject') {
    return sampleWords.filter((entry) => entry.subjectSlug === route.value);
  }

  if (route.page === 'grade') {
    return sampleWords.filter((entry) => entry.gradeSlug === route.value);
  }

  return sampleWords.filter((entry) => entry.examSlug === route.value);
}

const fullDefinitionKeys = [
  'partOfSpeech',
  'pronunciation',
  'wordForms',
  'exampleSentence',
  'synonyms',
  'antonyms',
  'memoryTrick',
  'origin',
] as const;

function hasFullDefinitionFields(word: Record<string, unknown>) {
  return fullDefinitionKeys.every((key) => Object.prototype.hasOwnProperty.call(word, key));
}

async function enrichDictionaryWord(word: Parameters<typeof normalizeWord>[0]) {
  if (hasFullDefinitionFields(word)) {
    return normalizeWord(word);
  }

  try {
    const definition = await api.define(word.word);
    return normalizeWord({ ...word, ...definition.result });
  } catch {
    return normalizeWord(word);
  }
}

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
      try {
        const data = await api.define(route.word);
        return {
          type: 'currentWord' as const,
          data: normalizeWord(data.result),
        };
      } catch (error) {
        const fallbackWord = getLocalWord(route.word);
        if (!fallbackWord) {
          throw error;
        }

        return {
          type: 'currentWord' as const,
          data: normalizeWord(fallbackWord),
        };
      }
    }

    if (route.page === 'dictionary') {
      const data = await api.dictionary(1, 50, '');
      return {
        type: 'collectionWords' as const,
        data: await Promise.all(data.words.map(enrichDictionaryWord)),
      };
    }

    if (route.page === 'subject' || route.page === 'grade' || route.page === 'exam') {
      try {
        const data =
          route.page === 'subject'
            ? await api.subject(route.value, 1, 50)
            : route.page === 'grade'
              ? await api.grade(route.value, 1, 50)
              : await api.exam(route.value, 1, 50);

        return {
          type: 'collectionWords' as const,
          data: data.words.map(normalizeWord),
        };
      } catch (error) {
        const fallbackWords = getLocalCollection(route);
        if (!fallbackWords.length) {
          throw error;
        }

        return {
          type: 'collectionWords' as const,
          data: fallbackWords.map(normalizeWord),
        };
      }
    }

    return null;
  } catch (error: unknown) {
    throw error instanceof Error ? error.message : 'Backend unavailable';
  }
});
