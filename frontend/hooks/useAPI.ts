import { useState, useCallback } from 'react';

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAPIReturn<T> extends UseAPIState<T> {
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
}

/**
 * Custom hook for handling API calls with loading states and error handling
 */
export function useAPI<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseAPIReturn<T> {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | void> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, loading: false, error: null }));
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error; // Re-throw to allow caller to handle if needed
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook specifically for handling paginated API calls
 */
export function usePaginatedAPI<T>(
  apiFunction: (page: number, ...args: any[]) => Promise<{ data: T[]; hasMore: boolean }>
) {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as string | null,
    hasMore: true,
    page: 1,
  });

  const loadMore = useCallback(
    async (...args: any[]) => {
      if (state.loading || !state.hasMore) return;

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiFunction(state.page, ...args);
        setState(prev => ({
          ...prev,
          data: [...prev.data, ...result.data],
          loading: false,
          hasMore: result.hasMore,
          page: prev.page + 1,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    [apiFunction, state.loading, state.hasMore, state.page]
  );

  const refresh = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null, page: 1 }));
      
      try {
        const result = await apiFunction(1, ...args);
        setState({
          data: result.data,
          loading: false,
          error: null,
          hasMore: result.hasMore,
          page: 2,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      hasMore: true,
      page: 1,
    });
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
    reset,
  };
}
