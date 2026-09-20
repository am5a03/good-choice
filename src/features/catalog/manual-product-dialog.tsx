import { useEffect, useState, type FormEvent } from 'react';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { NUTRIENTS } from '@shared/comparison';
import { ProductSchema, type NutrientKey, type Product } from '@shared/models';
import { useShelf } from '@/features/shelf/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ManualProductDialog({ open, initial, onClose }: { open: boolean; initial?: Product; onClose: () => void }) {
  return open ? <ManualForm initial={initial} onClose={onClose} /> : null;
}
function ManualForm({ initial, onClose }: { initial?: Product; onClose: () => void }) {
  const { setState } = useShelf(); const [error, setError] = useState(''); const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();
    const number = (key: string) => text(key) === '' ? null : Number(text(key));
    try {
      const source = { label: 'Your manual entry · unverified', verifiedAt: null, observedAt: new Date().toISOString() };
      const product = ProductSchema.parse({ ...initial, id: initial?.id ?? `custom-${crypto.randomUUID()}`, name: text('name'), brand: text('brand') || 'Your find',
        category: text('category'), price: number('price'), weight: number('weight'), source: source.label, updated: source.observedAt,
        nutrients: Object.fromEntries(Object.keys(NUTRIENTS).filter((key) => key !== 'price').map((key) => [key, number(key)])),
        ingredients: text('ingredients') ? text('ingredients').split(';').map((item) => item.trim()).filter(Boolean) : null,
        allergens: text('allergens') || null, provenance: { nutrition: source, ingredients: source, price: source },
      });
      setState((old) => {
        const custom = product.id.startsWith('custom-');
        const overrides = { ...old.overrides }; if (custom) delete overrides[product.id]; else overrides[product.id] = product;
        return { ...old, custom: custom ? [...old.custom.filter((item) => item.id !== product.id), product] : old.custom, overrides,
          saved: [...new Set([...old.saved, product.id])], selected: !old.selected.includes(product.id) && old.selected.length < 4 ? [...old.selected, product.id] : old.selected };
      });
      toast.success('Label saved locally as an unverified entry.'); onClose();
    } catch (cause) { setError(cause instanceof z.ZodError ? cause.errors.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(' ') : 'Please check the entered values.'); }
  }
  return <Dialog open onOpenChange={(value) => { if (!value) onClose(); }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{initial ? 'Edit your local label' : 'Bring a new label into focus.'}</DialogTitle><DialogDescription>Enter values per 100 g of the product as sold. Leave unreadable fields blank. This does not edit the shared catalog.</DialogDescription></DialogHeader>
    <div className="rounded-xl border border-dashed bg-white p-4"><label className="mb-2 flex items-center gap-2 text-sm font-medium" htmlFor="label-photo"><Camera className="size-4" />Photo for reference</label><Input id="label-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 6 * 1024 * 1024) { setError('Choose a JPG, PNG or WebP image smaller than 6 MB.'); return; } setError(''); setPreview(URL.createObjectURL(file)); }} />{preview && <img src={preview} alt="Local label reference" className="mt-3 max-h-48 w-full rounded-lg object-contain" />}<p className="mt-2 text-xs leading-5 text-muted-foreground">Preview only. No OCR, upload or image storage is performed.</p></div>
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs">Product name<Input name="name" required maxLength={150} defaultValue={initial?.name} /></label><label className="space-y-1 text-xs">Brand<Input name="brand" maxLength={100} defaultValue={initial?.brand} /></label><label className="space-y-1 text-xs">Category<select name="category" className="h-11 w-full" defaultValue={initial?.category ?? 'flakes'}><option value="flakes">Cereal & flakes</option><option value="granola">Granola</option></select></label><label className="space-y-1 text-xs">Package weight (g)<Input name="weight" type="number" min="0.1" max="10000" step="any" defaultValue={initial?.weight ?? ''} /></label><label className="space-y-1 text-xs">Package price (CAD)<Input name="price" type="number" min="0" max="10000" step="0.01" defaultValue={initial?.price ?? ''} /></label></div>
      <fieldset><legend className="mb-3 text-sm font-semibold">Nutrition per 100 g</legend><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{(Object.keys(NUTRIENTS) as (NutrientKey | 'price')[]).filter((key): key is NutrientKey => key !== 'price').map((key) => <label className="space-y-1 text-xs" key={key}>{NUTRIENTS[key].label} ({NUTRIENTS[key].unit})<Input name={key} type="number" step="any" min="0" max={key === 'sodium' ? 100000 : key === 'calories' ? 1000 : 100} placeholder="Unknown" defaultValue={initial?.nutrients[key] ?? ''} /></label>)}</div></fieldset>
      <label className="block space-y-1 text-xs">Ingredients (separate with semicolons)<textarea name="ingredients" rows={3} className="w-full" maxLength={10000} defaultValue={initial?.ingredients?.join('; ')} /></label><label className="block space-y-1 text-xs">Allergen statement as printed<textarea name="allergens" rows={2} className="w-full" maxLength={2000} defaultValue={initial?.allergens ?? ''} /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</p>}<div className="flex flex-wrap justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save unverified label</Button></div>
    </form>
  </DialogContent></Dialog>;
}
