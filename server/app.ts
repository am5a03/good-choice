import { Hono } from 'hono';
import { CatalogQuerySchema } from '../shared/models';
import { INGREDIENT_GUIDE } from '../shared/ingredient-guide';
import { createCatalogRepository, type CatalogRepository } from './catalog/repository';

export type Bindings = { DB: D1Database; ASSETS: Fetcher };
export function createApp(repositoryFactory: (bindings: Bindings) => CatalogRepository = (bindings) => createCatalogRepository(bindings.DB)) {
  const app = new Hono<{ Bindings: Bindings; Variables: { requestId: string } }>();
  app.use('*', async (context, next) => {
    context.set('requestId', crypto.randomUUID());
    context.header('X-Request-Id', context.get('requestId'));
    context.header('X-Content-Type-Options', 'nosniff');
    context.header('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(context.req.method)) {
      context.header('Allow', 'GET, HEAD');
      return context.json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'The public catalog is read-only.' } }, 405);
    }
    await next();
  });
  app.get('/api/health', async (context) => {
    await repositoryFactory(context.env).health();
    return context.json({ ok: true, service: 'good-choice', database: 'reachable' });
  });
  app.get('/api/products', async (context) => {
    const result = CatalogQuerySchema.safeParse(context.req.query());
    if (!result.success) return context.json({ error: { code: 'INVALID_QUERY', message: 'Check search, category, limit and offset.', issues: result.error.flatten() } }, 400);
    return context.json(await repositoryFactory(context.env).list(result.data));
  });
  app.get('/api/products/:id', async (context) => {
    const id = context.req.param('id');
    if (id.length > 120) return context.json({ error: { code: 'INVALID_ID', message: 'Product ID is too long.' } }, 400);
    const product = await repositoryFactory(context.env).byId(id);
    if (!product) return context.json({ error: { code: 'NOT_FOUND', message: 'Product not found in this catalog.' } }, 404);
    return context.json(product);
  });
  app.get('/api/barcodes/:barcode', async (context) => {
    const barcode = context.req.param('barcode').trim();
    if (!/^[A-Za-z0-9-]{1,80}$/.test(barcode)) return context.json({ error: { code: 'INVALID_BARCODE', message: 'Use a barcode or a sample code such as DEMO001.' } }, 400);
    const product = await repositoryFactory(context.env).byBarcode(barcode);
    if (!product) return context.json({ error: { code: 'NOT_FOUND', message: 'Not in this catalog. You can add the label manually.' } }, 404);
    return context.json(product);
  });
  app.get('/api/ingredients', (context) => context.json(INGREDIENT_GUIDE));
  app.notFound((context) => context.json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } }, 404));
  app.onError((error, context) => {
    // Never return SQL, bindings, credentials or an internal stack to a caller.
    console.error(JSON.stringify({ requestId: context.get('requestId'), error: error.name }));
    return context.json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'The catalog is temporarily unavailable. Check database setup and try again.', requestId: context.get('requestId') } }, 503);
  });
  return app;
}
