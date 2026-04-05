import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

/**
 * Auth Selectors
 */
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthMessage = (state: RootState) => state.auth.message;

export const selectIsAuthenticated = createSelector(
  [selectAuthUser],
  user => user !== null
);

export const selectAuthState = createSelector(
  [selectAuthUser, selectAuthLoading, selectAuthMessage],
  (user, loading, message) => ({
    user,
    loading,
    message,
  })
);

/**
 * Theme Selectors
 */
export const selectThemeMode = (state: RootState) => state.theme.mode;

export const selectIsLightTheme = createSelector(
  [selectThemeMode],
  mode => mode === 'light'
);

export const selectIsDarkTheme = createSelector(
  [selectThemeMode],
  mode => mode === 'dark'
);

/**
 * Routing Selectors
 */
export const selectRoute = (state: RootState) => state.routing.route;
export const selectCurrentPage = (state: RootState) => state.routing.route.page;

/**
 * UI Selectors
 */
export const selectUIDrawerOpen = (state: RootState) => state.ui.drawerOpen;
export const selectUIOpenDropdown = (state: RootState) => state.ui.openDropdown;
export const selectUIQuery = (state: RootState) => state.ui.query;
export const selectUISuggestions = (state: RootState) => state.ui.suggestions;

export const selectUIState = createSelector(
  [selectUIDrawerOpen, selectUIOpenDropdown, selectUIQuery, selectUISuggestions],
  (drawerOpen, openDropdown, query, suggestions) => ({
    drawerOpen,
    openDropdown,
    query,
    suggestions,
  })
);

/**
 * Words Selectors
 */
export const selectWordOfTheDay = (state: RootState) => state.words.wordOfTheDay;
export const selectCurrentWord = (state: RootState) => state.words.currentWord;
export const selectCollectionWords = (state: RootState) => state.words.collectionWords;
export const selectWordsLoading = (state: RootState) => state.words.loading;
export const selectWordsError = (state: RootState) => state.words.backendError;

export const selectWordsState = createSelector(
  [selectWordOfTheDay, selectCurrentWord, selectCollectionWords, selectWordsLoading, selectWordsError],
  (wordOfTheDay, currentWord, collectionWords, loading, error) => ({
    wordOfTheDay,
    currentWord,
    collectionWords,
    loading,
    error,
  })
);

export const selectWordCount = createSelector(
  [selectCollectionWords],
  words => words.length
);

/**
 * Speech Selectors
 */
export const selectSpeechVoice = (state: RootState) => state.speech.preferredVoice;
export const selectSpeechIsSpeaking = (state: RootState) => state.speech.isSpeaking;

/**
 * Combined Selectors for Performance
 */
export const selectAppState = createSelector(
  [selectAuthState, selectThemeMode, selectRoute, selectUIState, selectWordsState],
  (authState, themeMode, route, uiState, wordsState) => ({
    auth: authState,
    theme: { mode: themeMode },
    routing: { route },
    ui: uiState,
    words: wordsState,
  })
);
