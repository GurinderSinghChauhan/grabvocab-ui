import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';

import { store } from '../store/store';
import {
  setTheme,
  setPreferredVoice,
  setWordOfTheDay,
  setBackendError,
  setAuthUser,
} from '../store/slices';
import { api } from '../config/api';
import { normalizeWord } from '../utils/normalizeWord';
import type { SpeechVoice } from '../types/app';

const STORAGE_KEY = 'grabvocab_frontend_user';
const THEME_STORAGE_KEY = 'grabvocab_frontend_theme';

/**
 * Redux initialization component
 * Handles side effects: storage recovery, voice detection, word of day loading
 */
function ReduxInitializer() {
  // Load auth user from storage
  useEffect(() => {
    void (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as { token: string };
        const response = await api.me(parsed.token);
        store.dispatch(setAuthUser(response.user));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    })();
  }, []);

  // Load theme from storage
  useEffect(() => {
    void (async () => {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        store.dispatch(setTheme(storedTheme));
      }
    })();
  }, []);

  // Load preferred speech voice
  useEffect(() => {
    let active = true;

    const loadPreferredVoice = async () => {
      try {
        const voices = (await Speech.getAvailableVoicesAsync()) as SpeechVoice[];
        if (!active || !voices.length) return;

        const englishVoices = voices.filter((voice) =>
          voice.language?.toLowerCase().startsWith('en')
        );
        const rankedVoice =
          englishVoices.find((voice) => voice.quality?.toLowerCase() === 'enhanced') ??
          englishVoices.find((voice) =>
            /siri|samantha|ava|premium|natural|enhanced/i.test(voice.name ?? '')
          ) ??
          englishVoices.find((voice) => voice.language?.toLowerCase() === 'en-us') ??
          englishVoices[0];

        if (rankedVoice?.identifier && active) {
          store.dispatch(setPreferredVoice(rankedVoice.identifier));
        }
      } catch {
        // Voice detection failed, use default
      }
    };

    void loadPreferredVoice();

    return () => {
      active = false;
    };
  }, []);

  // Load word of the day
  useEffect(() => {
    let active = true;

    const loadWordOfTheDay = async () => {
      try {
        const data = await api.wordOfDay();
        if (!active) return;
        store.dispatch(
          setWordOfTheDay({
            ...normalizeWord(data),
            date: data.date,
          })
        );
      } catch (error: unknown) {
        if (!active) return;
        store.dispatch(
          setBackendError(error instanceof Error ? error.message : 'Backend unavailable')
        );
      }
    };

    void loadWordOfTheDay();

    return () => {
      active = false;
    };
  }, []);

  return null;
}

/**
 * Redux provider wrapper for the entire app
 */
export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ReduxInitializer />
      {children}
    </Provider>
  );
}

// Re-export store for external access if needed
export { store };
