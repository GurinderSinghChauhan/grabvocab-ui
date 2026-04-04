import { useCallback, useEffect } from 'react';

import { api } from '../config/api';
import { examOptions, gradeOptions, subjectOptions } from '../data/sampleWords';
import { normalizeWord } from '../utils/normalizeWord';
import type { RouteState } from '../types/app';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setRoute,
  setCurrentWord,
  setCollectionWords,
  setLoading,
  setBackendError,
  setPage,
  setAuthMessage,
  closeDrawer,
  closeDropdown,
} from '../store/slices';

/**
 * Custom hook for app routing, navigation, and layout logic
 * Handles page switching, data loading, and event handlers
 */
export function useAppLayout() {
  const dispatch = useAppDispatch();
  const route = useAppSelector((state) => state.routing.route);
  const currentWord = useAppSelector((state) => state.words.currentWord);
  const collectionWords = useAppSelector((state) => state.words.collectionWords);
  const loading = useAppSelector((state) => state.words.loading);
  const backendError = useAppSelector((state) => state.words.backendError);
  const page = useAppSelector((state) => state.routing.page);

  /**
   * Navigate to a new route with state cleanup
   */
  const navigate = useCallback(
    (next: RouteState) => {
      dispatch(setRoute(next));
      dispatch(closeDropdown());
      dispatch(closeDrawer());
      dispatch(setPage(1));
      dispatch(setAuthMessage(''));
      if (next.page !== 'word') dispatch(setCurrentWord(null));
    },
    [dispatch]
  );

  /**
   * Load data for the current route
   */
  async function loadRouteData(nextRoute: RouteState) {
    // Pages that don't need data loading
    if (
      nextRoute.page === 'home' ||
      nextRoute.page === 'about' ||
      nextRoute.page === 'share' ||
      nextRoute.page === 'quiz' ||
      nextRoute.page === 'auth'
    ) {
      return;
    }

    dispatch(setLoading(true));
    dispatch(setBackendError(null));

    try {
      if (nextRoute.page === 'word') {
        const data = await api.define(nextRoute.word);
        dispatch(setCurrentWord(normalizeWord(data.result)));
      } else if (nextRoute.page === 'dictionary') {
        const data = await api.dictionary(1, 50, '');
        dispatch(setCollectionWords(data.words.map(normalizeWord)));
      } else if (nextRoute.page === 'subject') {
        const data = await api.subject(nextRoute.value, 1, 50);
        dispatch(setCollectionWords(data.words.map(normalizeWord)));
      } else if (nextRoute.page === 'grade') {
        const data = await api.grade(nextRoute.value, 1, 50);
        dispatch(setCollectionWords(data.words.map(normalizeWord)));
      } else if (nextRoute.page === 'exam') {
        const data = await api.exam(nextRoute.value, 1, 50);
        dispatch(setCollectionWords(data.words.map(normalizeWord)));
      }
    } catch (error: unknown) {
      if (nextRoute.page === 'word') dispatch(setCurrentWord(null));
      else dispatch(setCollectionWords([]));
      dispatch(
        setBackendError(error instanceof Error ? error.message : 'Backend unavailable')
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Trigger data load when route or page changes
   */
  useEffect(() => {
    void loadRouteData(route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  /**
   * Check if navigation item is currently active
   */
  const isActive = useCallback(
    (label: string): boolean => {
      if (label === 'Dictionary A-Z') return route.page === 'dictionary';
      if (label === 'Quiz') return route.page === 'quiz';
      if (label === 'Subject') return route.page === 'subject';
      if (label === 'Grades') return route.page === 'grade';
      if (label === 'Exam') return route.page === 'exam';
      if (label === 'About Us') return route.page === 'about';
      if (label === 'Login / Signup') return route.page === 'auth';
      if (label === 'Social Media') return route.page === 'share';
      return false;
    },
    [route.page]
  );

  /**
   * Format filter title for display
   */
  const formattedFilterTitle = useCallback((): string => {
    if (route.page === 'subject' && 'value' in route) {
      return subjectOptions.find((item) => item.value === route.value)?.label ?? route.value;
    }
    if (route.page === 'grade' && 'value' in route) {
      return gradeOptions.find((item) => item.value === route.value)?.label ?? route.value;
    }
    if (route.page === 'exam' && 'value' in route) {
      return (examOptions.find((item) => item.value === route.value)?.label ?? route.value).toUpperCase();
    }
    return '';
  }, [route]);

  /**
   * Get page title for SEO/accessibility
   */
  const pageTitle = useCallback((): string => {
    switch (route.page) {
      case 'home':
        return 'home';
      case 'dictionary':
        return 'dictionary';
      case 'word':
        return currentWord?.word || (route.page === 'word' ? route.word : 'word');
      case 'about':
        return 'about';
      case 'share':
        return 'share';
      case 'quiz':
        return 'quiz';
      case 'subject':
        return 'subject';
      case 'grade':
        return 'grade';
      case 'exam':
        return 'exam';
      case 'auth':
        return 'auth';
      default:
        return 'grabvocab';
    }
  }, [route, currentWord?.word]);

  return {
    navigate,
    loadRouteData,
    isActive,
    formattedFilterTitle,
    pageTitle,
    route,
    currentWord,
    collectionWords,
    loading,
    backendError,
    page,
  };
}
