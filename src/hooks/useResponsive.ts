import { useWindowDimensions } from 'react-native';

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
