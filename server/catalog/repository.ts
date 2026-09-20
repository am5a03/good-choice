import { and, asc, count, eq, like, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { ProductSchema, type CatalogPage, type CatalogQuery, type Product } from '../../shared/models';
import { nutrition, priceObservations as prices, products } from '../db/schema';

export interface CatalogRepository {
  list(query: CatalogQuery): Promise<CatalogPage>;
  byId(id: string): Promise<Product | null>;
  byBarcode(barcode: string): Promise<Product | null>;
  health(): Promise<void>;
}
type Row = { product: typeof products.$inferSelect; nutrition: typeof nutrition.$inferSelect | null; price: typeof prices.$inferSelect | null };
function toProduct(row: Row): Product {
  const { product, nutrition: n, price } = row;
  return ProductSchema.parse({
    ...product, ...product.artwork, weight: price?.packageGrams ?? null, price: price ? price.priceCents / 100 : null,
    currency: price?.currency ?? 'CAD', updated: product.updatedAt,
    nutrients: n ?? {},
    provenance: {
      nutrition: { label: n?.source ?? 'Not captured', verifiedAt: n?.verifiedAt ?? null },
      ingredients: { label: product.source, verifiedAt: product.verifiedAt },
      price: { label: price?.source ?? 'Not captured', verifiedAt: price?.verifiedAt ?? null, observedAt: price?.observedAt ?? null },
    },
  });
}
export function createCatalogRepository(binding: D1Database): CatalogRepository {
  const db = drizzle(binding);
  // A correlated, indexed lookup selects one latest CAD price per product; no N+1 reads.
  const selection = () => db.select({ product: products, nutrition, price: prices }).from(products)
    .leftJoin(nutrition, eq(products.id, nutrition.productId))
    .leftJoin(prices, eq(prices.id, sql<string>`(SELECT id FROM price_observations WHERE product_id = ${products.id} AND currency = 'CAD' ORDER BY observed_at DESC, id DESC LIMIT 1)`));
  return {
    async list(query) {
      const where = and(eq(products.market, 'CA'), query.category ? eq(products.category, query.category) : undefined,
        query.q ? or(like(products.name, `%${query.q}%`), like(products.brand, `%${query.q}%`), eq(products.barcode, query.q.toUpperCase())) : undefined);
      const [rows, totals] = await Promise.all([
        selection().where(where).orderBy(asc(products.name), asc(products.id)).limit(query.limit).offset(query.offset).all(),
        db.select({ total: count() }).from(products).where(where).all(),
      ]);
      return { items: rows.map(toProduct), total: totals[0]?.total ?? 0, offset: query.offset, limit: query.limit };
    },
    async byId(id) {
      const row = await selection().where(and(eq(products.id, id), eq(products.market, 'CA'))).get();
      return row ? toProduct(row) : null;
    },
    async byBarcode(barcode) {
      const row = await selection().where(and(eq(products.market, 'CA'), eq(products.barcode, barcode.toUpperCase()))).get();
      return row ? toProduct(row) : null;
    },
    async health() { await db.run(sql`SELECT 1`); },
  };
}
