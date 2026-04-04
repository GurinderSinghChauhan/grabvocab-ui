import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SpeechState {
  preferredVoice: string | undefined;
  isSpeaking: boolean;
}

const initialState: SpeechState = {
  preferredVoice: undefined,
  isSpeaking: false,
};

export const speechSlice = createSlice({
  name: 'speech',
  initialState,
  reducers: {
    setPreferredVoice: (state, action: PayloadAction<string | undefined>) => {
      state.preferredVoice = action.payload;
    },
    setIsSpeaking: (state, action: PayloadAction<boolean>) => {
      state.isSpeaking = action.payload;
    },
  },
});

export const { setPreferredVoice, setIsSpeaking } = speechSlice.actions;
export default speechSlice.reducer;
