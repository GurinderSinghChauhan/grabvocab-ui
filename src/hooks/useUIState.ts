import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setDrawerOpen,
  toggleDrawer,
  closeDrawer,
  setOpenDropdown,
  closeDropdown,
} from '../store/slices';

/**
 * Custom hook for UI state with Redux
 */
export function useUIState() {
  const dispatch = useAppDispatch();
  const drawerOpen = useAppSelector((state) => state.ui.drawerOpen);
  const openDropdown = useAppSelector((state) => state.ui.openDropdown);

  const setDrawer = useCallback(
    (open: boolean) => {
      dispatch(setDrawerOpen(open));
    },
    [dispatch]
  );

  const toggleDrawerState = useCallback(() => {
    dispatch(toggleDrawer());
  }, [dispatch]);

  const closeDrawerState = useCallback(() => {
    dispatch(closeDrawer());
  }, [dispatch]);

  const setDropdown = useCallback(
    (dropdown: string | null) => {
      dispatch(setOpenDropdown(dropdown));
    },
    [dispatch]
  );

  const closeDropdownState = useCallback(() => {
    dispatch(closeDropdown());
  }, [dispatch]);

  return {
    drawerOpen,
    setDrawerOpen: setDrawer,
    openDrawer: () => dispatch(setDrawerOpen(true)),
    closeDrawer: closeDrawerState,
    toggleDrawer: toggleDrawerState,
    openDropdown,
    setOpenDropdown: setDropdown,
    closeDropdown: closeDropdownState,
  };
}
