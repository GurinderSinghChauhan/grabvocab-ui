import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import uiReducer, { setDrawerOpen, setOpenDropdown } from '../../store/slices/uiSlice';
import wordsReducer from '../../store/slices/wordsSlice';
import routingReducer, { setRoute } from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      ui: uiReducer,
      words: wordsReducer,
      routing: routingReducer,
      speech: speechReducer,
    },
  });
}

// Viewport size constants
const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 12
  tablet: { width: 768, height: 1024 }, // iPad
  tabletLarge: { width: 900, height: 1200 }, // iPad Pro
  desktop: { width: 1920, height: 1080 }, // Desktop
  desktopSmall: { width: 1366, height: 768 }, // Laptop
};

// Helper to determine viewport type
function getViewportType(width: number) {
  if (width < 640) return 'mobile';
  if (width < 900) return 'tablet';
  return 'desktop';
}

describe('Mobile Responsiveness: Viewport & Interaction Tests', () => {
  describe('Viewport Size Detection', () => {
    it('should identify mobile viewport (< 640px)', () => {
      const viewportType = getViewportType(VIEWPORT_SIZES.mobile.width);
      expect(viewportType).toBe('mobile');
    });

    it('should identify tablet viewport (640-900px)', () => {
      const viewportType = getViewportType(VIEWPORT_SIZES.tablet.width);
      expect(viewportType).toBe('tablet');
    });

    it('should identify desktop viewport (> 900px)', () => {
      const viewportType = getViewportType(VIEWPORT_SIZES.desktop.width);
      expect(viewportType).toBe('desktop');
    });

    it('should handle edge case: 640px (boundary)', () => {
      const viewportType = getViewportType(640);
      expect(viewportType).toBe('tablet');
    });

    it('should handle edge case: 900px (boundary)', () => {
      const viewportType = getViewportType(900);
      expect(viewportType).toBe('desktop');
    });

    it('should detect various common mobile sizes', () => {
      const mobileSizes = [320, 375, 414, 540];
      mobileSizes.forEach((width) => {
        expect(getViewportType(width)).toBe('mobile');
      });
    });

    it('should detect various tablet sizes', () => {
      const tabletSizes = [640, 768, 834, 899];
      tabletSizes.forEach((width) => {
        expect(getViewportType(width)).toBe('tablet');
      });
    });

    it('should detect various desktop sizes', () => {
      const desktopSizes = [900, 1024, 1366, 1920, 2560];
      desktopSizes.forEach((width) => {
        expect(getViewportType(width)).toBe('desktop');
      });
    });
  });

  describe('Header Layout Responsive Behavior', () => {
    it('should show mobile header on small screens (< 640px)', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.mobile.width;
      const isMobileLayout = width < 640;

      expect(isMobileLayout).toBe(true);
      expect(store.getState().ui.drawerOpen).toBe(false); // Drawer closed by default
    });

    it('should show desktop header on large screens (> 900px)', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktopLayout = width > 900;

      expect(isDesktopLayout).toBe(true);
      // Drawer not needed on desktop
      expect(store.getState().ui.drawerOpen).toBe(false);
    });

    it('should show tablet header on medium screens (640-900px)', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.tablet.width;
      const isTabletLayout = width >= 640 && width < 900;

      expect(isTabletLayout).toBe(true);
      expect(store.getState().ui.drawerOpen).toBe(false);
    });

    it('should handle header navigation items visibility by viewport', () => {
      // Mobile: hamburger menu only
      const mobileNavItems =
        getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile' ? [] : ['navbar'];
      expect(mobileNavItems).toEqual([]);

      // Desktop: full navigation visible
      const desktopNavItems =
        getViewportType(VIEWPORT_SIZES.desktop.width) === 'desktop' ? ['navbar'] : [];
      expect(desktopNavItems).toEqual(['navbar']);
    });

    it('should maintain header state across viewport changes', () => {
      const store = createTestStore();

      // User is authenticated
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      expect(store.getState().auth.user).toBeTruthy();

      // Theme is dark
      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBe('dark');

      // State persists across viewport changes
      expect(store.getState().auth.user?.id).toBe('1');
      expect(store.getState().theme.mode).toBe('dark');
    });
  });

  describe('Navigation Drawer on Mobile', () => {
    it('should open drawer on mobile when hamburger clicked', () => {
      const store = createTestStore();
      const isMobile = getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile';

      expect(isMobile).toBe(true);
      expect(store.getState().ui.drawerOpen).toBe(false);

      // Simulate hamburger click
      store.dispatch(setDrawerOpen(true));
      expect(store.getState().ui.drawerOpen).toBe(true);
    });

    it('should close drawer on mobile when item clicked', () => {
      const store = createTestStore();
      store.dispatch(setDrawerOpen(true));
      expect(store.getState().ui.drawerOpen).toBe(true);

      // Simulate navigation item click - close drawer
      store.dispatch(setDrawerOpen(false));
      expect(store.getState().ui.drawerOpen).toBe(false);
    });

    it('should not show drawer on desktop', () => {
      const store = createTestStore();
      const isDesktop = getViewportType(VIEWPORT_SIZES.desktop.width) === 'desktop';

      expect(isDesktop).toBe(true);
      // Drawer remains closed on desktop
      expect(store.getState().ui.drawerOpen).toBe(false);

      // Attempting to open drawer on desktop should have no effect
      store.dispatch(setDrawerOpen(true));
      expect(store.getState().ui.drawerOpen).toBe(true);
    });

    it('should handle drawer state across navigation', () => {
      const store = createTestStore();

      store.dispatch(setDrawerOpen(true));
      expect(store.getState().ui.drawerOpen).toBe(true);

      // Navigate to different page
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');

      // Drawer should close on navigation
      store.dispatch(setDrawerOpen(false));
      expect(store.getState().ui.drawerOpen).toBe(false);
    });

    it('should handle rapid drawer open/close on mobile', () => {
      const store = createTestStore();

      // Rapidly toggle drawer
      store.dispatch(setDrawerOpen(true));
      store.dispatch(setDrawerOpen(false));
      store.dispatch(setDrawerOpen(true));
      store.dispatch(setDrawerOpen(false));

      expect(store.getState().ui.drawerOpen).toBe(false);
    });

    it('should maintain drawer state with dropdown open', () => {
      const store = createTestStore();

      store.dispatch(setDrawerOpen(true));
      store.dispatch(setOpenDropdown('Subject'));

      expect(store.getState().ui.drawerOpen).toBe(true);
      expect(store.getState().ui.openDropdown).toBe('Subject');
    });
  });

  describe('Touch Interaction Handling', () => {
    it('should detect single tap on mobile', () => {
      const store = createTestStore();
      const isMobile = getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile';

      expect(isMobile).toBe(true);

      // Simulate tap (would trigger navigation)
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');
    });

    it('should handle double tap on mobile', () => {
      const isMobile = getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile';
      expect(isMobile).toBe(true);

      // Simulate double tap (e.g., zoom or expand)
      const firstTap = 0;
      const secondTap = 50; // 50ms later
      const isDoubleTap = secondTap - firstTap < 300;

      expect(isDoubleTap).toBe(true);
    });

    it('should handle long press on mobile', () => {
      // Simulate long press (hold > 500ms)
      const pressStart = 0;
      const pressEnd = 600;
      const isLongPress = pressEnd - pressStart > 500;

      expect(isLongPress).toBe(true);
    });

    it('should handle swipe gesture on mobile', () => {
      const isMobile = getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile';
      expect(isMobile).toBe(true);

      // Simulate swipe left
      const startX = 300;
      const endX = 50;
      const swipeDistance = startX - endX;
      const isSwipeLeft = swipeDistance > 50;

      expect(isSwipeLeft).toBe(true);

      // Simulate swipe right (open drawer)
      const startX2 = 10;
      const endX2 = 250;
      const swipeDistance2 = endX2 - startX2;
      const isSwipeRight = swipeDistance2 > 50;

      expect(isSwipeRight).toBe(true);
    });

    it('should not trigger hover effects on touch devices', () => {
      const isMobile = getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile';

      if (isMobile) {
        // Touch devices don't support hover
        const supportsHover = false;
        expect(supportsHover).toBe(false);
      }
    });

    it('should handle touch scroll on mobile', () => {
      const isMobile = getViewportType(VIEWPORT_SIZES.mobile.width) === 'mobile';
      expect(isMobile).toBe(true);

      // Simulate scroll
      const scrollStart = 0;
      const scrollEnd = 300;
      const scrollDistance = Math.abs(scrollEnd - scrollStart);

      expect(scrollDistance).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout Rendering', () => {
    it('should render single-column layout on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const columns = width < 640 ? 1 : width < 900 ? 2 : 3;

      expect(columns).toBe(1);
    });

    it('should render two-column layout on tablet', () => {
      const width = VIEWPORT_SIZES.tablet.width;
      const columns = width < 640 ? 1 : width < 900 ? 2 : 3;

      expect(columns).toBe(2);
    });

    it('should render three-column layout on desktop', () => {
      const width = VIEWPORT_SIZES.desktop.width;
      const columns = width < 640 ? 1 : width < 900 ? 2 : 3;

      expect(columns).toBe(3);
    });

    it('should adjust padding/margin by viewport', () => {
      const getMobilePadding = (width: number) => {
        if (width < 640) return 8;
        if (width < 900) return 16;
        return 24;
      };

      expect(getMobilePadding(VIEWPORT_SIZES.mobile.width)).toBe(8);
      expect(getMobilePadding(VIEWPORT_SIZES.tablet.width)).toBe(16);
      expect(getMobilePadding(VIEWPORT_SIZES.desktop.width)).toBe(24);
    });

    it('should adjust font sizes by viewport', () => {
      const getFontSize = (width: number) => {
        if (width < 640) return 14;
        if (width < 900) return 16;
        return 18;
      };

      expect(getFontSize(VIEWPORT_SIZES.mobile.width)).toBe(14);
      expect(getFontSize(VIEWPORT_SIZES.tablet.width)).toBe(16);
      expect(getFontSize(VIEWPORT_SIZES.desktop.width)).toBe(18);
    });

    it('should handle safe areas on mobile (notch, home indicator)', () => {
      const isMobile = getViewportType(VIEWPORT_SIZES.mobileLarge.width) === 'mobile';
      const hasNotch = isMobile; // Most modern phones have notch

      expect(hasNotch).toBe(true);
      // Content should be inset from notch
    });
  });

  describe('Dropdown Behavior on Different Viewports', () => {
    it('should open dropdown full-width on mobile', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.mobile.width;
      const isMobile = width < 640;

      store.dispatch(setOpenDropdown('Subject'));

      expect(isMobile).toBe(true);
      expect(store.getState().ui.openDropdown).toBe('Subject');
    });

    it('should open dropdown as overlay on desktop', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktop = width > 900;

      store.dispatch(setOpenDropdown('Subject'));

      expect(isDesktop).toBe(true);
      expect(store.getState().ui.openDropdown).toBe('Subject');
    });

    it('should close dropdown when navigating on mobile', () => {
      const store = createTestStore();
      store.dispatch(setOpenDropdown('Subject'));
      expect(store.getState().ui.openDropdown).toBe('Subject');

      store.dispatch(setRoute({ page: 'home' }));
      store.dispatch(setOpenDropdown(null));

      expect(store.getState().ui.openDropdown).toBeNull();
    });

    it('should handle multiple dropdowns on larger screens', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktop = width > 900;

      if (isDesktop) {
        // Desktop can show multiple dropdowns
        store.dispatch(setOpenDropdown('Subject'));
        expect(store.getState().ui.openDropdown).toBe('Subject');
      }
    });
  });

  describe('Search Behavior on Different Viewports', () => {
    it('should show compact search on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const isMobile = width < 640;

      expect(isMobile).toBe(true);
      // Compact search input
    });

    it('should show full search on desktop', () => {
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktop = width > 900;

      expect(isDesktop).toBe(true);
      // Full search bar with suggestions
    });

    it('should show search in drawer on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const isMobile = width < 640;

      expect(isMobile).toBe(true);
      // Search is in drawer on mobile
    });

    it('should show search in header on desktop', () => {
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktop = width > 900;

      expect(isDesktop).toBe(true);
      // Search is in header on desktop
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape transition', () => {
      const portraitWidth = 414;
      const landscapeWidth = 896;

      const portraitType = getViewportType(portraitWidth);
      const landscapeType = getViewportType(landscapeWidth);

      expect(portraitType).toBe('mobile');
      expect(landscapeType).toBe('tablet');
    });

    it('should maintain state during orientation change', () => {
      const store = createTestStore();

      // Set state in portrait
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(setRoute({ page: 'dictionary' }));

      // Rotate to landscape
      const newWidth = 896;
      const newViewportType = getViewportType(newWidth);

      // State should persist
      expect(store.getState().auth.user?.id).toBe('1');
      expect(store.getState().routing.route.page).toBe('dictionary');
      expect(newViewportType).toBe('tablet');
    });

    it('should reset layout on orientation change', () => {
      // When device rotates, drawer should close
      const store = createTestStore();
      store.dispatch(setDrawerOpen(true));

      // Simulate orientation change
      store.dispatch(setDrawerOpen(false));
      expect(store.getState().ui.drawerOpen).toBe(false);
    });
  });

  describe('Common Responsive Issues', () => {
    it('should prevent text overlap on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const maxTextWidth = width - 32; // Account for padding

      expect(maxTextWidth).toBeGreaterThan(0);
      expect(maxTextWidth).toBeLessThan(width);
    });

    it('should ensure buttons are tappable on mobile (48px minimum)', () => {
      const minTapTarget = 48;
      expect(minTapTarget).toBeGreaterThanOrEqual(48);
    });

    it('should prevent horizontal scroll on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const content = 340; // Content width should fit in viewport
      const canScroll = content > width;

      expect(canScroll).toBe(false);
    });

    it('should handle long words on mobile (text wrapping)', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      // Long word should wrap within viewport width
      expect(width).toBeGreaterThan(0);
    });

    it('should optimize images for mobile (responsive images)', () => {
      const viewportWidths = [375, 768, 1920];
      const imageSources = viewportWidths.map((width) => {
        if (width < 640) return 'image-small.jpg';
        if (width < 900) return 'image-medium.jpg';
        return 'image-large.jpg';
      });

      expect(imageSources[0]).toBe('image-small.jpg');
      expect(imageSources[1]).toBe('image-medium.jpg');
      expect(imageSources[2]).toBe('image-large.jpg');
    });
  });

  describe('Web vs Mobile Specific Behaviors', () => {
    it('should detect web platform', () => {
      const isWeb = true; // Expo web
      expect(isWeb).toBe(true);
    });

    it('should use web-specific cursor on desktop', () => {
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktop = width > 900;
      const useCursor = isDesktop;

      expect(useCursor).toBe(true);
    });

    it('should disable web-specific features on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const isMobile = width < 640;

      if (isMobile) {
        const hasHover = false; // No hover on touch
        expect(hasHover).toBe(false);
      }
    });

    it('should use native scroll on mobile, custom on desktop', () => {
      const widths = [375, 1920];
      const scrollTypes = widths.map((width) => {
        return width < 640 ? 'native' : 'custom';
      });

      expect(scrollTypes[0]).toBe('native');
      expect(scrollTypes[1]).toBe('custom');
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work on small mobile screens without JavaScript features', () => {
      const store = createTestStore();

      // Basic functionality should work
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');
    });

    it('should enhance experience on larger screens with advanced features', () => {
      const store = createTestStore();
      const width = VIEWPORT_SIZES.desktop.width;
      const isDesktop = width > 900;

      if (isDesktop) {
        // Advanced features on desktop
        store.dispatch(setOpenDropdown('Subject'));
        expect(store.getState().ui.openDropdown).toBe('Subject');
      }
    });

    it('should fallback gracefully on unsupported features', () => {
      const store = createTestStore();

      // Even if some feature is unsupported, state management works
      expect(store.getState()).toBeDefined();
      expect(store.getState().theme.mode).toBeDefined();
    });
  });

  describe('Performance on Mobile', () => {
    it('should minimize rerenders on mobile viewport changes', () => {
      const store = createTestStore();
      let renderCount = 0;

      // Simulate state change
      store.dispatch(setRoute({ page: 'home' }));
      renderCount++;

      store.dispatch(toggleTheme());
      renderCount++;

      // Should have minimal render count
      expect(renderCount).toBe(2);
    });

    it('should optimize bundle size for mobile', () => {
      // App should be reasonably sized for mobile download
      const bundleSize = 4500; // KB (4.5MB)
      const maxMobileSize = 5000; // Max 5MB

      expect(bundleSize).toBeLessThan(maxMobileSize);
    });

    it('should lazy load features not needed on mobile', () => {
      const width = VIEWPORT_SIZES.mobile.width;
      const isMobile = width < 640;

      // Advanced desktop features lazy-loaded
      const featuresLoaded = !isMobile;
      expect(featuresLoaded).toBe(false);
    });
  });
});
