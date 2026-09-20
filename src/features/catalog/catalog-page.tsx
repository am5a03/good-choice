import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Check, Plus, ScanLine, Search } from 'lucide-react';
import type { Product } from '@shared/models';
import { applyOverride } from '@shared/shelf';
import { money, formatValue } from '@shared/comparison';
import type { IngredientCard } from '@shared/ingredient-guide';
import { useCatalog } from './queries';
import { useShelf } from '@/features/shelf/store';
import { ProductArt } from '@/components/product-art';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ErrorState, LoadingState } from '@/components/page-state';
import { ProductDialog } from './product-dialog';
import { ManualProductDialog } from './manual-product-dialog';
import { ScanDialog } from './scan-dialog';
import { IngredientDialog } from '@/features/guide/guide-page';

export function CatalogPage() {
  const { state, toggleSelected, toggleSaved } = useShelf();
  const [query, setQuery] = useState(''); const [debounced, setDebounced] = useState(''); const [category, setCategory] = useState('all');
  const [detail, setDetail] = useState<Product | null>(null); const [manual, setManual] = useState<Product | 'new' | null>(null);
  const [scan, setScan] = useState(false); const [ingredient, setIngredient] = useState<IngredientCard | null>(null);
  useEffect(() => { const timer = setTimeout(() => setDebounced(query), 180); return () => clearTimeout(timer); }, [query]);
  const catalog = useCatalog(debounced, category);
  const local = state.custom.filter((product) => (category === 'all' || product.category === category) && `${product.name} ${product.brand}`.toLowerCase().includes(debounced.toLowerCase()));
  const products = [...local, ...(catalog.data?.pages.flatMap((page) => page.items) ?? [])].map((product) => applyOverride(product, state.overrides[product.id]));
  return <>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-3">The breakfast aisle</p><h1 className="page-title">A good morning starts<br /><span className="text-[#7c8e64]">with a little clarity.</span></h1><p className="mt-3 text-sm text-muted-foreground">Find a familiar favourite. Give a new one a fair comparison.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setScan(true)}><ScanLine />Barcode lookup</Button><Button onClick={() => setManual('new')}><Plus />Add a label</Button></div></div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="relative min-w-0 grow sm:max-w-md"><Search className="absolute left-3 top-3 size-5 text-muted-foreground" /><Input className="pl-10" placeholder="Search products, brands or a demo barcode…" aria-label="Search products" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} /></div><div className="flex flex-wrap gap-2">{[['all', 'All cereals'], ['flakes', 'Flakes & grains'], ['granola', 'Granola']].map(([id, label]) => <Button key={id} size="sm" variant={category === id ? 'secondary' : 'ghost'} aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</Button>)}</div></div>
    <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{catalog.data ? `${catalog.data.pages[0].total + local.length} products` : 'Finding products…'}</span><span>Fictional starter catalog · Prices are not live</span></div>
    {catalog.isPending ? <LoadingState /> : catalog.isError ? <ErrorState error={catalog.error} retry={() => void catalog.refetch()} /> : <>
      <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{products.map((product) => <Card key={product.id} className="overflow-hidden p-3"><div className="relative"><button className="block w-full" onClick={() => setDetail(product)} aria-label={`View ${product.name}`}><ProductArt product={product} className="h-48 w-full sm:h-52" /></button><Button variant="ghost" size="icon" className="absolute right-1 top-1 rounded-full bg-white/80" aria-label={`${state.saved.includes(product.id) ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={state.saved.includes(product.id)} onClick={() => toggleSaved(product.id)}><Bookmark fill={state.saved.includes(product.id) ? 'currentColor' : 'none'} /></Button>{state.usual === product.id && <Badge className="absolute bottom-3 left-3 bg-white/95">Your usual</Badge>}</div><div className="px-1 pb-1 pt-4"><p className="eyebrow mb-1">{product.brand}</p><h2 className="mb-2 text-sm font-semibold"><button className="text-left hover:underline" onClick={() => setDetail(product)}>{product.name}</button></h2><div className="mb-4 flex items-end justify-between gap-2"><span className="text-sm font-semibold">{money(product.price)}<span className="ml-1 text-[10px] font-normal text-muted-foreground">/ {product.weight ?? '?'} g</span></span><span className="text-[10px] text-muted-foreground">{formatValue(product, 'price')} / 100 g</span></div><Button className="w-full" variant={state.selected.includes(product.id) ? 'secondary' : 'outline'} aria-pressed={state.selected.includes(product.id)} aria-label={`${state.selected.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${state.selected.includes(product.id) ? 'from' : 'to'} comparison`} onClick={() => toggleSelected(product.id)}>{state.selected.includes(product.id) ? <Check /> : <Plus />}{state.selected.includes(product.id) ? 'In your comparison' : 'Compare'}</Button></div></Card>)}</div>
      {!products.length && <div className="space-y-4 py-14 text-center"><h2 className="font-serif text-2xl">Nothing in this little aisle yet.</h2><p className="text-sm text-muted-foreground">Try another search, or enter the label yourself.</p><Button variant="outline" onClick={() => setManual('new')}>Add a label</Button></div>}
      {catalog.hasNextPage && <div className="mt-6 text-center"><Button variant="outline" disabled={catalog.isFetchingNextPage} onClick={() => void catalog.fetchNextPage()}>{catalog.isFetchingNextPage ? 'Loading…' : 'Load more products'}</Button></div>}
    </>}
    {state.selected.length > 0 && <div className="fixed bottom-24 left-5 right-5 z-20 flex items-center justify-between gap-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur sm:left-8 sm:right-8 lg:bottom-5 lg:left-[calc(15rem+2.5rem)] lg:right-10"><p className="text-xs text-muted-foreground"><strong className="text-primary">{state.selected.length} selected</strong><span className="hidden sm:inline"> · Bring two to four products to the table.</span></p><Button asChild><Link to="/compare">Compare products <ArrowRight /></Link></Button></div>}
    <ProductDialog product={detail} onClose={() => setDetail(null)} onEdit={(product) => { setDetail(null); setManual(product); }} onIngredient={(card) => { setDetail(null); setIngredient(card); }} />
    <ManualProductDialog open={manual !== null} initial={manual && manual !== 'new' ? manual : undefined} onClose={() => setManual(null)} />
    <ScanDialog open={scan} onClose={() => setScan(false)} onMatch={setDetail} onManual={() => setManual('new')} /><IngredientDialog card={ingredient} onClose={() => setIngredient(null)} />
  </>;
}
