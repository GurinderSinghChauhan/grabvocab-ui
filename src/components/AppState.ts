import { useWindowDimensions } from 'react-native';
import { useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadSuggestions } from '../store/thunks';
import {
  setTheme,
  toggleTheme as reduxToggleTheme,
  setIsSpeaking,
  setPage,
  setLoading,
  setBackendError,
  clearError,
  clearCurrentWord,
  clearCollection,
  setWordOfTheDay,
  setCurrentWord,
  setCollectionWords,
  setQuery,
  setSuggestions,
  clearSearch,
  setLimit,
  setAuthUser,
  setAuthLoading,
  setAuthMessage,
  clearAuthMessage,
  logout,
  setDrawerOpen,
  toggleDrawer,
  closeDrawer,
  setOpenDropdown,
  closeDropdown,
} from '../store/slices';
import { themeMap } from '../config/themes';
import type { ThemeMode } from '../types/app';

/**
 * Custom hook for theme management with Redux
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const colors = themeMap[mode];

  const setThemeMode = useCallback(
    (theme: ThemeMode) => {
      dispatch(setTheme(theme));
    },
    [dispatch]
  );

  const toggleThemeMode = useCallback(() => {
    dispatch(reduxToggleTheme());
  }, [dispatch]);

  return {
    theme: mode,
    setTheme: setThemeMode,
    colors,
    toggleTheme: toggleThemeMode,
  };
}

/**
 * Custom hook for speech/text-to-speech with Redux
 */
export function useSpeech() {
  const dispatch = useAppDispatch();
  const preferredVoice = useAppSelector((state) => state.speech.preferredVoice);
  const isSpeaking = useAppSelector((state) => state.speech.isSpeaking);

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      try {
        Speech.stop();
        dispatch(setIsSpeaking(true));

        Speech.speak(text, {
          language: 'en-US',
          voice: preferredVoice,
          pitch: 1.0,
          rate: 0.85,
          onDone: () => {
            dispatch(setIsSpeaking(false));
          },
          onError: () => {
            dispatch(setIsSpeaking(false));
          },
        });
      } catch {
        dispatch(setIsSpeaking(false));
      }
    },
    [dispatch, preferredVoice]
  );

  const stopSpeech = useCallback(() => {
    try {
      Speech.stop();
      dispatch(setIsSpeaking(false));
    } catch {
      // Ignore errors on web where Speech might not be fully supported
    }
  }, [dispatch]);

  return {
    speak,
    stopSpeech,
    isSpeaking,
    preferredVoice,
  };
}

/**
 * Custom hook for search with Redux
 */
export function useSearch() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.ui.query);
  const suggestions = useAppSelector((state) => state.ui.suggestions);

  const setQueryText = useCallback(
    (text: string) => {
      dispatch(setQuery(text));
    },
    [dispatch]
  );

  const setSuggestionsData = useCallback(
    (data: string[]) => {
      dispatch(setSuggestions(data));
    },
    [dispatch]
  );

  const clearSearchData = useCallback(() => {
    dispatch(clearSearch());
  }, [dispatch]);

  // Dispatch thunk when query changes
  useEffect(() => {
    if (!query.trim()) {
      dispatch(setSuggestions([]));
      return;
    }
    void dispatch(loadSuggestions(query));
  }, [query, dispatch]);

  return {
    query,
    setQuery: setQueryText,
    suggestions,
    setSuggestions: setSuggestionsData,
    clearSearch: clearSearchData,
  };
}

/**
 * Custom hook for pagination with Redux
 */
export function usePagination() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.routing.page);
  const limit = useAppSelector((state) => state.routing.limit);

  const goToNextPage = useCallback(
    (totalPages: number) => {
      dispatch(setPage(Math.min(page + 1, totalPages)));
    },
    [dispatch, page]
  );

  const goToPreviousPage = useCallback(() => {
    dispatch(setPage(Math.max(page - 1, 1)));
  }, [dispatch, page]);

  const setPageNum = useCallback(
    (pageNum: number) => {
      dispatch(setPage(pageNum));
    },
    [dispatch]
  );

  const setPageLimit = useCallback(
    (pageLimit: number) => {
      dispatch(setLimit(pageLimit));
    },
    [dispatch]
  );

  return {
    page,
    setPage: setPageNum,
    limit,
    setLimit: setPageLimit,
    goToNextPage,
    goToPreviousPage,
  };
}

/**
 * Custom hook for authentication with Redux
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const authMessage = useAppSelector((state) => state.auth.message);

  const setUser = useCallback(
    (user: typeof authUser) => {
      dispatch(setAuthUser(user));
    },
    [dispatch]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch(setAuthLoading(loading));
    },
    [dispatch]
  );

  const setMessage = useCallback(
    (message: string) => {
      dispatch(setAuthMessage(message));
    },
    [dispatch]
  );

  const clearMsg = useCallback(() => {
    dispatch(clearAuthMessage());
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    authUser,
    setAuthUser: setUser,
    authLoading,
    setAuthLoading: setLoading,
    authMessage,
    setAuthMessage: setMessage,
    clearMessage: clearMsg,
    logout: logoutUser,
    isAuthenticated: !!authUser,
  };
}

/**
 * Custom hook for UI state with Redux
 */
export function useUIState() {
  const dispatch = useAppDispatch();
  const drawerOpen = useAppSelector((state) => state.ui.drawerOpen);
  const openDropdown = useAppSelector((state) => state.ui.openDropdown);

  const setDrawer = useCallback(
    (open: boolean) => {
      dispatch(setDrawerOpen(open));
    },
    [dispatch]
  );

  const toggleDrawerState = useCallback(() => {
    dispatch(toggleDrawer());
  }, [dispatch]);

  const closeDrawerState = useCallback(() => {
    dispatch(closeDrawer());
  }, [dispatch]);

  const setDropdown = useCallback(
    (dropdown: string | null) => {
      dispatch(setOpenDropdown(dropdown));
    },
    [dispatch]
  );

  const closeDropdownState = useCallback(() => {
    dispatch(closeDropdown());
  }, [dispatch]);

  return {
    drawerOpen,
    setDrawerOpen: setDrawer,
    openDrawer: () => dispatch(setDrawerOpen(true)),
    closeDrawer: closeDrawerState,
    toggleDrawer: toggleDrawerState,
    openDropdown,
    setOpenDropdown: setDropdown,
    closeDropdown: closeDropdownState,
  };
}

/**
 * Custom hook for word data with Redux
 */
export function useWordData() {
  const dispatch = useAppDispatch();
  const wordOfTheDay = useAppSelector((state) => state.words.wordOfTheDay);
  const currentWord = useAppSelector((state) => state.words.currentWord);
  const collectionWords = useAppSelector((state) => state.words.collectionWords);
  const loading = useAppSelector((state) => state.words.loading);
  const backendError = useAppSelector((state) => state.words.backendError);

  const setWord = useCallback(
    (word: typeof currentWord) => {
      dispatch(setCurrentWord(word));
    },
    [dispatch]
  );

  const setWords = useCallback(
    (words: typeof collectionWords) => {
      dispatch(setCollectionWords(words));
    },
    [dispatch]
  );

  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      dispatch(setLoading(isLoading));
    },
    [dispatch]
  );

  const setError = useCallback(
    (error: string | null) => {
      dispatch(setBackendError(error));
    },
    [dispatch]
  );

  const clearErrorMsg = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearWordData = useCallback(() => {
    dispatch(clearCurrentWord());
  }, [dispatch]);

  const clearWordsData = useCallback(() => {
    dispatch(clearCollection());
  }, [dispatch]);

  return {
    wordOfTheDay,
    setWordOfTheDay: (word: typeof wordOfTheDay) => dispatch(setWordOfTheDay(word)),
    currentWord,
    setCurrentWord: setWord,
    clearCurrentWord: clearWordData,
    collectionWords,
    setCollectionWords: setWords,
    clearCollection: clearWordsData,
    loading,
    setLoading: setIsLoading,
    backendError,
    setBackendError: setError,
    clearError: clearErrorMsg,
    hasError: !!backendError,
  };
}

/**
 * Custom hook for responsive design
 */
export function useResponsive() {
  const { width } = useWindowDimensions();

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  const isTabletUp = width >= 768;

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    isTabletUp,
  };
}

/**
 * Comprehensive hook combining all Redux hooks
 */
export function useAppState() {
  const theme = useTheme();
  const speech = useSpeech();
  const search = useSearch();
  const pagination = usePagination();
  const auth = useAuth();
  const ui = useUIState();
  const wordData = useWordData();
  const responsive = useResponsive();

  return {
    theme,
    speech,
    search,
    pagination,
    auth,
    ui,
    wordData,
    responsive,
  };
}
