import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { WordData } from '../../types/app';
import { loadRouteData } from '../thunks';

interface WordsState {
  wordOfTheDay: WordData | null;
  currentWord: WordData | null;
  collectionWords: WordData[];
  loading: boolean;
  backendError: string | null;
}

const initialState: WordsState = {
  wordOfTheDay: null,
  currentWord: null,
  collectionWords: [],
  loading: false,
  backendError: null,
};

export const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    setWordOfTheDay: (state, action: PayloadAction<WordData | null>) => {
      state.wordOfTheDay = action.payload;
    },
    setCurrentWord: (state, action: PayloadAction<WordData | null>) => {
      state.currentWord = action.payload;
    },
    setCollectionWords: (state, action: PayloadAction<WordData[]>) => {
      state.collectionWords = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBackendError: (state, action: PayloadAction<string | null>) => {
      state.backendError = action.payload;
    },
    clearError: (state) => {
      state.backendError = null;
    },
    clearCurrentWord: (state) => {
      state.currentWord = null;
    },
    clearCollection: (state) => {
      state.collectionWords = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRouteData.pending, (state) => {
        state.loading = true;
        state.backendError = null;
      })
      .addCase(loadRouteData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload === null) return;
        if (action.payload.type === 'currentWord') {
          state.currentWord = action.payload.data;
        } else if (action.payload.type === 'collectionWords') {
          state.collectionWords = action.payload.data;
        }
      })
      .addCase(loadRouteData.rejected, (state, action) => {
        state.loading = false;
        state.backendError = action.error.message || 'Backend unavailable';
      });
  },
});

export const {
  setWordOfTheDay,
  setCurrentWord,
  setCollectionWords,
  setLoading,
  setBackendError,
  clearError,
  clearCurrentWord,
  clearCollection,
} = wordsSlice.actions;
export default wordsSlice.reducer;
