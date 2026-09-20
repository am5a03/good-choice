import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Check, Pencil, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { ProductOverrideSchema, type Product } from '@shared/models';
import { applyOverride } from '@shared/shelf';
import { ingredientCard, type IngredientCard } from '@shared/ingredient-guide';
import { formatValue, money } from '@shared/comparison';
import { useShelf } from '@/features/shelf/store';
import { ProductArt } from '@/components/product-art';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ProductDialog(props: { product: Product | null; onClose: () => void; onEdit: (product: Product) => void; onIngredient: (card: IngredientCard) => void }) {
  return props.product ? <ProductDialogBody key={props.product.id} {...props} product={props.product} /> : null;
}
function ProductDialogBody({ product, onClose, onEdit, onIngredient }: { product: Product; onClose: () => void; onEdit: (product: Product) => void; onIngredient: (card: IngredientCard) => void }) {
  const { state, setState, toggleSaved } = useShelf(); const navigate = useNavigate();
  const p = applyOverride(state.custom.find((item) => item.id === product.id) ?? product, state.overrides[product.id]);
  const [editingPrice, setEditingPrice] = useState(false); const [error, setError] = useState('');
  const savePrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try {
      const parse = (key: string) => String(form.get(key) ?? '').trim() === '' ? null : Number(form.get(key));
      const change = ProductOverrideSchema.parse({ price: parse('price'), weight: parse('weight'), provenance: {
        nutrition: p.provenance?.nutrition ?? { label: p.source, verifiedAt: null }, ingredients: p.provenance?.ingredients ?? { label: p.source, verifiedAt: null },
        price: { label: 'Your shelf price · unverified', verifiedAt: null, observedAt: new Date().toISOString() },
      } });
      setState((old) => ({ ...old, overrides: { ...old.overrides, [p.id]: { ...old.overrides[p.id], ...change } } }));
      setEditingPrice(false); setError(''); toast.success('Your local price has been updated.');
    } catch { setError('Enter a nonnegative price and a package weight greater than zero, or leave either blank.'); }
  };
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-w-2xl"><DialogHeader><div className="mb-2 flex gap-2"><Badge>{p.isDemo ? 'Fictional demo product' : 'Your entry · unverified'}</Badge>{state.usual === p.id && <Badge variant="outline">Your usual</Badge>}</div><DialogTitle>{p.name}</DialogTitle><DialogDescription>{p.brand} · {p.market} · {p.weight ?? '?'} g</DialogDescription></DialogHeader>
    <div className="grid grid-cols-[110px_1fr] gap-5"><ProductArt product={p} className="h-40" /><div className="space-y-3"><p className="text-xl font-semibold">{money(p.price)}<span className="ml-2 text-xs font-normal text-muted-foreground">per package</span></p><p className="text-sm text-muted-foreground">{formatValue(p, 'price')} per 100 g</p><p className="text-[11px] text-muted-foreground">{p.provenance?.price.label ?? p.source}</p><Button variant="outline" size="sm" onClick={() => setEditingPrice(!editingPrice)}><Pencil />Edit package price</Button></div></div>
    {editingPrice && <form onSubmit={savePrice} className="space-y-3 rounded-xl border bg-white p-4"><div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs">Price (CAD)<Input name="price" aria-label="Package price in CAD" type="number" min="0" max="10000" step="0.01" defaultValue={p.price ?? ''} /></label><label className="space-y-1 text-xs">Package weight (g)<Input name="weight" aria-label="Package weight in grams" type="number" min="0.1" max="10000" step="any" defaultValue={p.weight ?? ''} /></label></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button size="sm" type="submit">Save price locally</Button></form>}
    <section><h3 className="mb-2 text-sm font-semibold">Ingredients</h3>{p.ingredients ? <div className="flex flex-wrap gap-2">{p.ingredients.map((ingredient, index) => { const card = ingredientCard(ingredient); return card ? <button key={index} className="rounded-lg border bg-secondary px-3 py-2 text-xs text-primary underline underline-offset-2" onClick={() => onIngredient(card)}>{ingredient}</button> : <span key={index} className="rounded-lg bg-muted px-3 py-2 text-xs">{ingredient}</span>; })}</div> : <p className="text-sm text-muted-foreground">Ingredient list not captured. We will not fill it in.</p>}<p className="mt-3 text-[11px] text-muted-foreground">{p.provenance?.ingredients.label ?? p.source} · {p.provenance?.ingredients.verifiedAt ? `Verified ${p.provenance.ingredients.verifiedAt}` : 'Not verified against a current package'}</p></section>
    <section className="rounded-xl bg-amber-50 p-4"><h3 className="mb-1 text-sm font-semibold">Allergen statement</h3><p className="text-sm leading-6">{p.allergens || 'Not captured.'}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Missing information does not establish absence. Check the current label; this is not an allergy-safety assessment.</p></section>
    <div className="flex flex-wrap gap-2 border-t pt-4"><Button onClick={() => { setState((old) => ({ ...old, usual: p.id, saved: [...new Set([...old.saved, p.id])] })); toast.success('Your usual cereal is updated.'); }} variant="secondary"><Check />Make this my usual</Button><Button variant="outline" onClick={() => toggleSaved(p.id)}><Bookmark fill={state.saved.includes(p.id) ? 'currentColor' : 'none'} />{state.saved.includes(p.id) ? 'Saved' : 'Save product'}</Button><Button variant="outline" onClick={() => onEdit(p)}><Pencil />Edit label locally</Button><Button onClick={() => { setState((old) => ({ ...old, selected: [...new Set([old.usual, p.id])] })); onClose(); navigate(p.id === state.usual ? '/shop' : '/compare'); }}><SlidersHorizontal />Compare with my usual</Button></div>
  </DialogContent></Dialog>;
}
