import { z } from 'zod';
import { MetricSchema, ProductOverrideSchema, ProductSchema, type Product, type ProductOverride } from './models';
const id = z.string().min(1).max(120).regex(/^[a-z0-9][a-z0-9-]*$/i);
export const DecisionSchema = z.object({
  id, selected: z.array(id).min(2).max(4), metric: MetricSchema, basis: z.enum(['100', 'bowl']), bowl: z.number().finite().min(10).max(200),
  usual: id, created: z.string().max(100),
});
export const ShelfSchema = z.object({
  version: z.literal(2), selected: z.array(id).max(4), saved: z.array(id).max(500), usual: id,
  metric: MetricSchema, basis: z.enum(['100', 'bowl']), bowl: z.number().finite().min(10).max(200),
  custom: z.array(ProductSchema).max(500).refine((items) => items.every((item) => item.id.startsWith('custom-')), 'Manual products must have custom IDs.'),
  overrides: z.record(id, ProductOverrideSchema), decisions: z.array(DecisionSchema).max(100),
});
export type Shelf = z.infer<typeof ShelfSchema>;
export const defaultShelf = (): Shelf => ({ version: 2, selected: ['sunny', 'field'], saved: ['sunny', 'field'], usual: 'sunny', metric: 'fibre', basis: '100', bowl: 40, custom: [], overrides: {}, decisions: [] });
export function decodeShelf(input: unknown): Shelf {
  if (!input || typeof input !== 'object') throw new Error('This is not a GoodChoice export.');
  const object = input as Record<string, unknown>;
  const raw = 'settings' in object ? object.settings : object;
  if (!raw || typeof raw !== 'object') throw new Error('Missing shelf settings.');
  const record = raw as Record<string, unknown>;
  if (record.version !== 1 && record.version !== 2) throw new Error('Unsupported shelf export version.');
  // Version 1 is the original single-file prototype. Extra legacy presentation fields are discarded.
  const parsed = ShelfSchema.parse({ ...record, version: 2 });
  return { ...parsed, selected: [...new Set(parsed.selected)], saved: [...new Set(parsed.saved)] };
}
export function applyOverride(product: Product, override?: ProductOverride): Product {
  return override ? ProductSchema.parse({ ...product, ...override, id: product.id, nutrients: { ...product.nutrients, ...override.nutrients } }) : product;
}
