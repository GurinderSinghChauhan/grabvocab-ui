import { configureStore } from '@reduxjs/toolkit';

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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
