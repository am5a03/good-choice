import { z } from 'zod';
import { CatalogPageSchema, ProductSchema } from '@shared/models';
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function get<S extends z.ZodTypeAny>(path: string, schema: S, signal?: AbortSignal): Promise<z.infer<S>> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new ApiError('The server did not return catalog data. Check the Worker API routing.', response.status);
  const body = await response.json();
  if (!response.ok) throw new ApiError(body.error?.message ?? 'Could not load the catalog.', response.status);
  return schema.parse(body);
}
export const api = {
  list(q: string, category: string, offset: number, signal?: AbortSignal) {
    const params = new URLSearchParams({ q, offset: String(offset), limit: '24' });
    if (category !== 'all') params.set('category', category);
    return get(`/api/products?${params}`, CatalogPageSchema, signal);
  },
  product: (id: string, signal?: AbortSignal) => get(`/api/products/${encodeURIComponent(id)}`, ProductSchema, signal),
  barcode: (code: string) => get(`/api/barcodes/${encodeURIComponent(code.trim())}`, ProductSchema),
};
