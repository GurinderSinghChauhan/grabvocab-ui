import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { WordData } from '../../types/app';

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
