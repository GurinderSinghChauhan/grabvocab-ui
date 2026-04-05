import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCurrentWord,
  setCollectionWords,
  setLoading,
  setBackendError,
  clearError,
  clearCurrentWord,
  clearCollection,
  setWordOfTheDay,
} from '../store/slices';

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
