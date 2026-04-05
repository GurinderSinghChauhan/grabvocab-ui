import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';

import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import routingReducer from './slices/routingSlice';
import wordsReducer from './slices/wordsSlice';
import uiReducer from './slices/uiSlice';
import speechReducer from './slices/speechSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    routing: routingReducer,
    words: wordsReducer,
    ui: uiReducer,
    speech: speechReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in speech state (Voice objects)
        ignoredActions: ['speech/setPreferredVoice'],
        ignoredPaths: ['speech.preferredVoice'],
      },
    }),
  devTools: {
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      type: action.type,
    }),
    stateSanitizer: (state) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
