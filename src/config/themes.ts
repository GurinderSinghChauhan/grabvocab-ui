import type { ThemeColors, ThemeMode } from '../types/app';

export const themeMap: Record<ThemeMode, ThemeColors> = {
  light: {
    backgroundGradient: '#f5f5f5',
    backgroundColor: 'transparent',
    accentColor: '#000000',
    primaryText: '#1a1a1a',
    secondaryText: '#555555',
    borderColor: '#cbcbce',
    headerColor: '#e5e3e3',
    buttonBg: '#ffffff',
    chipBg: '#e6f4ff',
    chipText: '#4dabf7',
    overlay: 'rgba(0,0,0,0.4)',
    dropdownHover: '#ffbaba',
    spotlightBg: '#dcfce7',
  },
  dark: {
    backgroundGradient: '#1f1f1f',
    backgroundColor: 'transparent',
    accentColor: '#ffffff',
    primaryText: '#fafafa',
    secondaryText: '#a3a3a3',
    borderColor: '#8c8989',
    headerColor: '#454545',
    buttonBg: '#222222',
    chipBg: '#2d3d4d',
    chipText: '#8ec5ff',
    overlay: 'rgba(0,0,0,0.55)',
    dropdownHover: '#6b4b4b',
    spotlightBg: '#204533',
  },
};
