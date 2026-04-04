import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  drawerOpen: boolean;
  openDropdown: string | null;
  query: string;
  suggestions: string[];
}

const initialState: UIState = {
  drawerOpen: false,
  openDropdown: null,
  query: '',
  suggestions: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    closeDrawer: (state) => {
      state.drawerOpen = false;
    },
    setOpenDropdown: (state, action: PayloadAction<string | null>) => {
      state.openDropdown = action.payload;
    },
    closeDropdown: (state) => {
      state.openDropdown = null;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.suggestions = [];
    },
  },
});

export const {
  setDrawerOpen,
  toggleDrawer,
  closeDrawer,
  setOpenDropdown,
  closeDropdown,
  setQuery,
  setSuggestions,
  clearSearch,
} = uiSlice.actions;
export default uiSlice.reducer;
