import { useInfiniteQuery, useQueries } from '@tanstack/react-query';
import { applyOverride } from '@shared/shelf';
import { api } from '@/lib/api';
import { useShelf } from '@/features/shelf/store';
export function useCatalog(q: string, category: string) {
  return useInfiniteQuery({ queryKey: ['catalog', q, category], initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => api.list(q, category, pageParam, signal),
    getNextPageParam: (last) => last.offset + last.items.length < last.total && last.items.length > 0 ? last.offset + last.items.length : undefined,
  });
}
export function useProducts(ids: string[]) {
  const { state } = useShelf();
  const queries = useQueries({ queries: ids.map((id) => ({ queryKey: ['product', id], queryFn: ({ signal }: { signal: AbortSignal }) => api.product(id, signal), enabled: !state.custom.some((product) => product.id === id) })) });
  const items = ids.map((id, index) => state.custom.find((product) => product.id === id) ?? queries[index].data).filter((product) => product !== undefined).map((product) => applyOverride(product, state.overrides[product.id]));
  return { items, loading: queries.some((query, index) => query.isPending && !state.custom.some((product) => product.id === ids[index])), error: queries.find((query) => query.isError)?.error, retry: () => queries.forEach((query) => void query.refetch()) };
}
