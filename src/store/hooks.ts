import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { AppDispatch, RootState } from './store';

/**
 * Pre-typed useDispatch hook for Redux
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed useSelector hook for Redux
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
