import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPage, setLimit } from '../store/slices';

/**
 * Custom hook for pagination with Redux
 */
export function usePagination() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.routing.page);
  const limit = useAppSelector((state) => state.routing.limit);

  const goToNextPage = useCallback(
    (totalPages: number) => {
      dispatch(setPage(Math.min(page + 1, totalPages)));
    },
    [dispatch, page]
  );

  const goToPreviousPage = useCallback(() => {
    dispatch(setPage(Math.max(page - 1, 1)));
  }, [dispatch, page]);

  const setPageNum = useCallback(
    (pageNum: number) => {
      dispatch(setPage(pageNum));
    },
    [dispatch]
  );

  const setPageLimit = useCallback(
    (pageLimit: number) => {
      dispatch(setLimit(pageLimit));
    },
    [dispatch]
  );

  return {
    page,
    setPage: setPageNum,
    limit,
    setLimit: setPageLimit,
    goToNextPage,
    goToPreviousPage,
  };
}
