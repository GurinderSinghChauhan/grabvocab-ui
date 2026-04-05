import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setAuthUser,
  setAuthLoading,
  setAuthMessage,
  clearAuthMessage,
  logout,
} from '../slices/authSlice';

describe('authSlice', () => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });

  it('should have initial auth state', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.message).toBe('');
  });

  it('should set user', () => {
    const user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    store.dispatch(setAuthUser(user));
    expect(store.getState().auth.user).toEqual(user);
  });

  it('should set loading state', () => {
    store.dispatch(setAuthLoading(true));
    expect(store.getState().auth.loading).toBe(true);

    store.dispatch(setAuthLoading(false));
    expect(store.getState().auth.loading).toBe(false);
  });

  it('should set message', () => {
    const message = 'Test message';
    store.dispatch(setAuthMessage(message));
    expect(store.getState().auth.message).toBe(message);
  });

  it('should clear message', () => {
    store.dispatch(setAuthMessage('Test message'));
    store.dispatch(clearAuthMessage());
    expect(store.getState().auth.message).toBe('');
  });

  it('should logout user', () => {
    const user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    store.dispatch(setAuthUser(user));
    expect(store.getState().auth.user).toEqual(user);

    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.message).toBe('');
  });
});
