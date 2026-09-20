import { z } from 'zod';

const quantity = (maximum: number) => z.number().finite().min(0).max(maximum).nullable().default(null);
export const NutrientsSchema = z.object({
  calories: quantity(1000), fat: quantity(100), saturated: quantity(100), carbs: quantity(100),
  sugars: quantity(100), addedSugars: quantity(100), fibre: quantity(100), protein: quantity(100), sodium: quantity(100000),
}).superRefine((n, context) => {
  const subsets = [['sugars', 'carbs'], ['saturated', 'fat'], ['addedSugars', 'sugars']] as const;
  for (const [part, whole] of subsets) {
    if (n[part] !== null && n[whole] !== null && n[part]! > n[whole]!) {
      context.addIssue({ code: 'custom', path: [part], message: `${part} cannot exceed ${whole}.` });
    }
  }
});
export type Nutrients = z.infer<typeof NutrientsSchema>;
export type NutrientKey = keyof Nutrients;
export const SourceSchema = z.object({
  label: z.string().max(500), verifiedAt: z.string().nullable().default(null), observedAt: z.string().nullable().default(null),
});
export const ProductSchema = z.object({
  id: z.string().min(1).max(120), brand: z.string().max(100).default('Your find'), name: z.string().min(1).max(150),
  category: z.enum(['flakes', 'granola']).default('flakes'), barcode: z.string().max(80).nullable().default(null),
  market: z.literal('CA').default('CA'), currency: z.literal('CAD').default('CAD'),
  weight: z.number().finite().positive().max(10000).nullable().default(null), price: quantity(10000),
  nutrients: NutrientsSchema, ingredients: z.array(z.string().min(1).max(500)).max(150).nullable().default(null),
  allergens: z.string().max(2000).nullable().default(null),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).default('#c0cca8'), dark: z.string().regex(/^#[0-9a-f]{6}$/i).default('#596d43'),
  scene: z.string().regex(/^#[0-9a-f]{6}$/i).default('#edf1e3'),
  line1: z.string().max(30).default('your'), line2: z.string().max(30).default('find'), sub: z.string().max(100).default('a label to understand'),
  type: z.enum(['rings', 'flakes', 'clusters']).default('flakes'),
  source: z.string().max(500).default('Your entry · unverified'), updated: z.string().nullable().default(null), isDemo: z.boolean().default(false),
  provenance: z.object({ nutrition: SourceSchema, ingredients: SourceSchema, price: SourceSchema }).optional(),
});
export type Product = z.infer<typeof ProductSchema>;
export const ProductOverrideSchema = ProductSchema.omit({ id: true }).partial();
export type ProductOverride = z.infer<typeof ProductOverrideSchema>;
export const MetricSchema = z.enum(['fibre', 'sugars', 'sodium', 'price']);
export type Metric = z.infer<typeof MetricSchema>;
export const CatalogQuerySchema = z.object({
  q: z.string().trim().max(100).default(''), category: z.enum(['flakes', 'granola']).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(24), offset: z.coerce.number().int().min(0).max(100000).default(0),
});
export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;
export const CatalogPageSchema = z.object({ items: z.array(ProductSchema), total: z.number().int().nonnegative(), offset: z.number().int(), limit: z.number().int() });
export type CatalogPage = z.infer<typeof CatalogPageSchema>;
