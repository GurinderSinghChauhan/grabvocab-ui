import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/api';
import { sampleWords } from '../data/sampleWords';
import { normalizeWord } from '../utils/normalizeWord';
import type { RouteState } from '../types/app';

type LoadRouteDataArgs =
  | RouteState
  | {
      route: RouteState;
      page?: number;
      limit?: number;
    };

function normalizeLoadArgs(args: LoadRouteDataArgs) {
  if ('route' in args) {
    return {
      route: args.route,
      page: args.page ?? 1,
      limit: args.limit ?? 10,
    };
  }

  return {
    route: args,
    page: 1,
    limit: 10,
  };
}

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

function paginateLocalWords(words: typeof sampleWords, page: number, limit: number) {
  return {
    words: words.slice((page - 1) * limit, page * limit),
    totalPages: Math.max(1, Math.ceil(words.length / limit)),
  };
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
export const loadRouteData = createAsyncThunk('words/loadRouteData', async (args: LoadRouteDataArgs) => {
  const { route, page, limit } = normalizeLoadArgs(args);

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
        const data = await api.define(route.word, route.context);
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
      const data = await api.dictionary(page, limit, '');
      return {
        type: 'collectionWords' as const,
        data: await Promise.all(data.words.map(enrichDictionaryWord)),
        totalPages: data.totalPages,
      };
    }

    if (route.page === 'subject' || route.page === 'grade' || route.page === 'exam') {
      try {
        const data =
          route.page === 'subject'
            ? await api.subject(route.value, page, limit)
            : route.page === 'grade'
              ? await api.grade(route.value, page, limit)
              : await api.exam(route.value, page, limit);

        return {
          type: 'collectionWords' as const,
          data: data.words.map(normalizeWord),
          totalPages: data.totalPages,
        };
      } catch (error) {
        const fallback = paginateLocalWords(getLocalCollection(route), page, limit);
        if (!fallback.words.length) {
          throw error;
        }

        return {
          type: 'collectionWords' as const,
          data: fallback.words.map(normalizeWord),
          totalPages: fallback.totalPages,
        };
      }
    }

    return null;
  } catch (error: unknown) {
    throw error instanceof Error ? error.message : 'Backend unavailable';
  }
});
