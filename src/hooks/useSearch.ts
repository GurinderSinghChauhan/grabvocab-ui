import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadSuggestions } from '../store/thunks';
import { setQuery, setSuggestions, clearSearch } from '../store/slices';

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
