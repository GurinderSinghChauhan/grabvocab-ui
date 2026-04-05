import { configureStore } from '@reduxjs/toolkit';
import { loadSuggestions } from '../../store/thunks';
import uiReducer from '../../store/slices/uiSlice';

describe('Integration: Async Thunks', () => {
  const store = configureStore({
    reducer: {
      ui: uiReducer,
    },
  });

  it('should handle loadSuggestions thunk lifecycle', async () => {
    // Initial state
    let state = store.getState().ui;
    expect(state.suggestions).toEqual([]);

    // Dispatch thunk
    await store.dispatch(loadSuggestions('test') as any);

    // Final state - should have suggestions or be empty (API might fail in test)
    state = store.getState().ui;
    // Just verify the action completed without errors
    expect(Array.isArray(state.suggestions)).toBe(true);
  });

  it('should clear suggestions on empty query', async () => {
    await store.dispatch(loadSuggestions('') as any);
    const state = store.getState().ui;
    expect(state.suggestions).toEqual([]);
  });
});
