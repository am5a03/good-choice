import { describe, expect, it, vi } from 'vitest';
import { createApp, type Bindings } from '../server/app';
import { CatalogPageSchema, ProductSchema } from '../shared/models';
import type { CatalogRepository } from '../server/catalog/repository';
import { products } from './fixtures';

function app(repository: Partial<CatalogRepository> = {}) {
  return createApp(() => ({
    async list(query) {
      const matches = products.filter((item) => (!query.category || item.category === query.category) && `${item.name} ${item.brand}`.toLowerCase().includes(query.q.toLowerCase()));
      return { items: matches.slice(query.offset, query.offset + query.limit), total: matches.length, limit: query.limit, offset: query.offset };
    },
    async byId(id) { return products.find((item) => item.id === id) ?? null; },
    async byBarcode(barcode) { return products.find((item) => item.barcode === barcode.toUpperCase()) ?? null; },
    async health() {}, ...repository,
  }));
}
const bindings = {} as Bindings;

describe('read-only Worker API', () => {
  it('returns a bounded catalog page', async () => {
    const response = await app().request('/api/products?limit=2', {}, bindings);
    const body = CatalogPageSchema.parse(await response.json());
    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(8);
  });
  it('validates query parameters', async () => {
    expect((await app().request('/api/products?limit=-1', {}, bindings)).status).toBe(400);
  });
  it('returns missing values as JSON null', async () => {
    const response = await app().request('/api/products/unknown', {}, bindings);
    const body = ProductSchema.parse(await response.json());
    expect(body.ingredients).toBeNull();
    expect(body.nutrients.fibre).toBeNull();
  });
  it('resolves sample barcode IDs', async () => {
    const response = await app().request('/api/barcodes/DEMO002', {}, bindings);
    expect(ProductSchema.parse(await response.json()).id).toBe('field');
  });
  it('returns JSON 404s instead of an SPA document', async () => {
    const response = await app().request('/api/not-a-route', {}, bindings);
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');
  });
  it('does not expose unauthenticated catalog writes', async () => {
    const response = await app().request('/api/products', { method: 'POST' }, bindings);
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, HEAD');
  });
  it('does not expose internal errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await app({ async health() { throw new Error('private SQL and credentials'); } }).request('/api/health', {}, bindings);
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain('private SQL');
    } finally { spy.mockRestore(); }
  });
});
