import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setAuthUser,
  setAuthLoading,
  setAuthMessage,
  clearAuthMessage,
  logout,
} from '../store/slices';

/**
 * Custom hook for authentication with Redux
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const authMessage = useAppSelector((state) => state.auth.message);

  const setUser = useCallback(
    (user: typeof authUser) => {
      dispatch(setAuthUser(user));
    },
    [dispatch]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch(setAuthLoading(loading));
    },
    [dispatch]
  );

  const setMessage = useCallback(
    (message: string) => {
      dispatch(setAuthMessage(message));
    },
    [dispatch]
  );

  const clearMsg = useCallback(() => {
    dispatch(clearAuthMessage());
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    authUser,
    setAuthUser: setUser,
    authLoading,
    setAuthLoading: setLoading,
    authMessage,
    setAuthMessage: setMessage,
    clearMessage: clearMsg,
    logout: logoutUser,
    isAuthenticated: !!authUser,
  };
}
