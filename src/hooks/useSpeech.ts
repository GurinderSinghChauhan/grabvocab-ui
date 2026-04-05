import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setIsSpeaking } from '../store/slices';

/**
 * Custom hook for speech/text-to-speech with Redux
 */
export function useSpeech() {
  const dispatch = useAppDispatch();
  const preferredVoice = useAppSelector((state) => state.speech.preferredVoice);
  const isSpeaking = useAppSelector((state) => state.speech.isSpeaking);

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      try {
        Speech.stop();
        dispatch(setIsSpeaking(true));

        Speech.speak(text, {
          language: 'en-US',
          voice: preferredVoice,
          pitch: 1.0,
          rate: 0.85,
          onDone: () => {
            dispatch(setIsSpeaking(false));
          },
          onError: () => {
            dispatch(setIsSpeaking(false));
          },
        });
      } catch {
        dispatch(setIsSpeaking(false));
      }
    },
    [dispatch, preferredVoice]
  );

  const stopSpeech = useCallback(() => {
    try {
      Speech.stop();
      dispatch(setIsSpeaking(false));
    } catch {
      // Ignore errors on web where Speech might not be fully supported
    }
  }, [dispatch]);

  return {
    speak,
    stopSpeech,
    isSpeaking,
    preferredVoice,
  };
}
