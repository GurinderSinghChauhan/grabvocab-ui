import { useTheme } from './useTheme';
import { useSpeech } from './useSpeech';
import { useSearch } from './useSearch';
import { usePagination } from './usePagination';
import { useAuth } from './useAuth';
import { useUIState } from './useUIState';
import { useWordData } from './useWordData';
import { useResponsive } from './useResponsive';

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

// Export individual hooks
export { useTheme };
export { useSpeech };
export { useSearch };
export { usePagination };
export { useAuth };
export { useUIState };
export { useWordData };
export { useResponsive };
