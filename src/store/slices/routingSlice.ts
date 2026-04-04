import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RouteState } from '../../types/app';

interface RoutingState {
  route: RouteState;
  page: number;
  limit: number;
}

const initialState: RoutingState = {
  route: { page: 'home' },
  page: 1,
  limit: 10,
};

export const routingSlice = createSlice({
  name: 'routing',
  initialState,
  reducers: {
    setRoute: (state, action: PayloadAction<RouteState>) => {
      state.route = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    resetRouting: (state) => {
      state.route = { page: 'home' };
      state.page = 1;
      state.limit = 10;
    },
  },
});

export const { setRoute, setPage, setLimit, resetRouting } = routingSlice.actions;
export default routingSlice.reducer;
