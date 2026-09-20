import { sql } from 'drizzle-orm';
import { check, index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Product identity and label transcription. Unknown ingredient lists stay NULL.
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  barcode: text('barcode'),
  brand: text('brand').notNull(),
  name: text('name').notNull(),
  category: text('category', { enum: ['flakes', 'granola'] }).notNull(),
  market: text('market').notNull().default('CA'),
  ingredients: text('ingredients', { mode: 'json' }).$type<string[] | null>(),
  allergens: text('allergens'),
  artwork: text('artwork', { mode: 'json' }).$type<{ color: string; dark: string; scene: string; line1: string; line2: string; sub: string; type: 'rings' | 'flakes' | 'clusters' }>().notNull(),
  source: text('source').notNull(),
  verifiedAt: text('verified_at'),
  isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
}, (t) => [
  uniqueIndex('products_market_barcode_unique').on(t.market, t.barcode),
  index('products_category_idx').on(t.category),
  check('products_category_check', sql`${t.category} IN ('flakes', 'granola')`),
]);

// All nutrient values describe 100 g of the product as sold, never 100 mL.
// NULL means not captured/not declared, NOT zero. The API preserves that distinction.
export const nutrition = sqliteTable('nutrition', {
  productId: text('product_id').primaryKey().references(() => products.id, { onDelete: 'cascade' }),
  calories: real('calories'),
  fat: real('fat'),
  saturated: real('saturated'),
  carbs: real('carbs'),
  sugars: real('sugars'),
  addedSugars: real('added_sugars'),
  fibre: real('fibre'),
  protein: real('protein'),
  sodium: real('sodium'),
  source: text('source').notNull(),
  verifiedAt: text('verified_at'),
}, (t) => [
  check('nutrition_calories_range', sql`${t.calories} IS NULL OR ${t.calories} BETWEEN 0 AND 1000`),
  check('nutrition_sodium_range', sql`${t.sodium} IS NULL OR ${t.sodium} BETWEEN 0 AND 100000`),
  check('nutrition_grams_range', sql`(${t.fat} IS NULL OR ${t.fat} BETWEEN 0 AND 100) AND (${t.saturated} IS NULL OR ${t.saturated} BETWEEN 0 AND 100) AND (${t.carbs} IS NULL OR ${t.carbs} BETWEEN 0 AND 100) AND (${t.sugars} IS NULL OR ${t.sugars} BETWEEN 0 AND 100) AND (${t.addedSugars} IS NULL OR ${t.addedSugars} BETWEEN 0 AND 100) AND (${t.fibre} IS NULL OR ${t.fibre} BETWEEN 0 AND 100) AND (${t.protein} IS NULL OR ${t.protein} BETWEEN 0 AND 100)`),
  check('nutrition_sugar_subset', sql`${t.sugars} IS NULL OR ${t.carbs} IS NULL OR ${t.sugars} <= ${t.carbs}`),
  check('nutrition_fat_subset', sql`${t.saturated} IS NULL OR ${t.fat} IS NULL OR ${t.saturated} <= ${t.fat}`),
  check('nutrition_added_sugar_subset', sql`${t.addedSugars} IS NULL OR ${t.sugars} IS NULL OR ${t.addedSugars} <= ${t.sugars}`),
]);

// Prices are observations, not timeless product attributes. Amounts stored in cents.
export const priceObservations = sqliteTable('price_observations', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  priceCents: integer('price_cents').notNull(),
  packageGrams: real('package_grams').notNull(),
  currency: text('currency').notNull().default('CAD'),
  retailer: text('retailer'),
  source: text('source').notNull(),
  observedAt: text('observed_at').notNull(),
  verifiedAt: text('verified_at'),
}, (t) => [
  index('prices_product_observed_idx').on(t.productId, t.observedAt),
  check('prices_amount_check', sql`${t.priceCents} >= 0`),
  check('prices_weight_check', sql`${t.packageGrams} > 0`),
]);
