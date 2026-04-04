import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '../../types/app';

interface AuthState {
  user: User | null;
  loading: boolean;
  message: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  message: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearAuthMessage: (state) => {
      state.message = '';
    },
    logout: (state) => {
      state.user = null;
      state.message = '';
    },
  },
});

export const { setAuthUser, setAuthLoading, setAuthMessage, clearAuthMessage, logout } =
  authSlice.actions;
export default authSlice.reducer;
