import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme, toggleTheme as reduxToggleTheme } from '../store/slices';
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
