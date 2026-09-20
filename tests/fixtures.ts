import raw from '../db/seed/products.json';
import { ProductSchema } from '../shared/models';
export const products = raw.map((product) => ProductSchema.parse({ ...product, isDemo: true, source: 'Fictional demo dataset' }));
export const product = (id: string) => structuredClone(products.find((item) => item.id === id)!);
