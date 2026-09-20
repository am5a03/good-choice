import { describe, expect, it } from 'vitest';
import { compareProducts, explainComparison, formatValue, valueAt, valuePer100 } from '../shared/comparison';
import { ProductSchema, CatalogQuerySchema } from '../shared/models';
import { decodeShelf, defaultShelf, applyOverride } from '../shared/shelf';
import { product, products } from './fixtures';

describe('deterministic comparison', () => {
  it('prefers Fieldwork for fibre and the usual for lower sugar', () => {
    const pair = [product('sunny'), product('field')];
    expect(compareProducts(pair, 'fibre', 'sunny').winners[0].id).toBe('field');
    expect(compareProducts(pair, 'sugars', 'sunny').winners[0].id).toBe('sunny');
    expect(explainComparison(pair, 'sugars', 'sunny').title).toBe('Your usual fits this priority.');
  });
  it('compares unit prices instead of package prices', () => { expect(compareProducts([product('daybreak'), product('oatco')], 'price', 'daybreak').winners[0].id).toBe('oatco'); });
  it.each(['fibre', 'sugars', 'sodium', 'price'] as const)('preserves a real tie for %s', (metric) => { const result = compareProducts([product('sunny'), product('north')], metric, 'sunny'); expect(result.status).toBe('tie'); expect(result.winners).toHaveLength(2); });
  it('does not recommend a winner when the selected nutrient is missing', () => { const result = compareProducts([product('sunny'), product('unknown')], 'fibre', 'sunny'); expect(result.status).toBe('missing'); expect(result.winners).toHaveLength(0); });
  it('can compare a known nutrient while other fields remain unknown', () => { expect(compareProducts([product('sunny'), product('unknown')], 'sugars', 'sunny').winners[0].id).toBe('sunny'); });
  it('keeps null separate from zero', () => { const item = product('field'); item.nutrients.fibre = 0; expect(valuePer100(item, 'fibre')).toBe(0); item.nutrients.fibre = null; expect(valuePer100(item, 'fibre')).toBeNull(); });
  it('normalizes every value to the same bowl size', () => { expect(valueAt(product('field'), 'fibre', 40)).toBeCloseTo(6.4); expect(valueAt(product('field'), 'price', 40)).toBeCloseTo(0.569); });
  it('never invents added sugars', () => { expect(formatValue(product('field'), 'addedSugars')).toBe('Not declared'); });
  it('rejects nonpositive serving quantities', () => { expect(() => valueAt(product('sunny'), 'fibre', 0)).toThrow(); });
  it('does not divide by a missing or zero package weight', () => { const item = product('sunny'); item.weight = 0; expect(valuePer100(item, 'price')).toBeNull(); item.weight = null; expect(valuePer100(item, 'price')).toBeNull(); });
  it('does not compare a product with itself', () => { const item = product('sunny'); expect(compareProducts([item, item], 'fibre', 'sunny').status).toBe('insufficient'); });
  it('accepts a genuine zero price', () => { const item = product('sunny'); item.price = 0; expect(valuePer100(item, 'price')).toBe(0); });
});
describe('contracts and migration', () => {
  it('validates every seed fixture', () => { expect(products).toHaveLength(8); for (const item of products) expect(ProductSchema.safeParse(item).success).toBe(true); });
  it.each([NaN, Infinity, -1])('rejects invalid numeric values: %s', (price) => { expect(ProductSchema.safeParse({ ...product('sunny'), price }).success).toBe(false); });
  it('rejects sugar amounts larger than carbohydrate', () => { const item = product('sunny'); item.nutrients.sugars = 90; expect(ProductSchema.safeParse(item).success).toBe(false); });
  it('rejects saturated fat larger than total fat', () => { const item = product('sunny'); item.nutrients.saturated = 90; expect(ProductSchema.safeParse(item).success).toBe(false); });
  it('limits pagination to bounded queries', () => { expect(CatalogQuerySchema.safeParse({ limit: 61 }).success).toBe(false); expect(CatalogQuerySchema.parse({}).limit).toBe(24); });
  it('migrates a version 1 prototype export', () => { const legacy = { ...defaultShelf(), version: 1, metric: 'sodium' }; const result = decodeShelf({ settings: legacy }); expect(result.version).toBe(2); expect(result.metric).toBe('sodium'); });
  it('rejects unsupported export versions without replacing data', () => { expect(() => decodeShelf({ ...defaultShelf(), version: 99 })).toThrow(); });
  it('applies a local price without changing nutrition or the original product', () => { const original = product('sunny'); const edited = applyOverride(original, { price: 0 }); expect(edited.price).toBe(0); expect(edited.nutrients).toEqual(original.nutrients); expect(original.price).toBe(4.49); });
});
