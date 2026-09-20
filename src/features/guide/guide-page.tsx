import { useState } from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { INGREDIENT_GUIDE, type IngredientCard } from '@shared/ingredient-guide';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export function IngredientDialog({ card, onClose }: { card: IngredientCard | null; onClose: () => void }) {
  return <Dialog open={!!card} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent>{card && <><DialogHeader><Badge className="mb-2 w-fit">{card.tag}</Badge><DialogTitle>{card.name}</DialogTitle><DialogDescription>{card.intro}</DialogDescription></DialogHeader><p className="text-sm leading-7">{card.body}</p><div className="rounded-xl bg-secondary p-4 text-sm leading-6">{card.context}</div><div className="border-t pt-4"><p className="eyebrow mb-2">Source & scope</p><a href={card.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary underline">{card.source}<ArrowUpRight className="size-4" /></a><p className="mt-2 text-xs leading-5 text-muted-foreground">General reference information, not a product-specific assessment. Check the current package for allergies and restrictions.</p></div></>}</DialogContent></Dialog>;
}
export function GuidePage() {
  const [query, setQuery] = useState(''); const [card, setCard] = useState<IngredientCard | null>(null);
  const matches = INGREDIENT_GUIDE.filter((item) => `${item.name} ${item.tag} ${item.body}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="mb-8"><p className="eyebrow mb-3">A little understanding</p><h1 className="page-title">An unfamiliar name.<br /><span className="text-[#7c8e64]">A clearer explanation.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Understand an ingredient’s role without turning every label into a safety score.</p></div><Input aria-label="Search the ingredient guide" placeholder="Search ingredients or label questions…" value={query} onChange={(event) => setQuery(event.target.value)} className="mb-6 max-w-lg" /><div className="grid gap-5 md:grid-cols-2">{matches.map((item) => <Card key={item.id} className="p-6"><div className="mb-5 flex items-start justify-between"><span className="flex size-12 items-center justify-center rounded-xl bg-secondary font-serif text-3xl text-primary">{item.symbol}</span><Badge variant="outline">{item.tag}</Badge></div><h2 className="mb-2 text-lg font-semibold">{item.name}</h2><p className="mb-4 text-sm leading-6 text-muted-foreground">{item.intro}</p><Button variant="link" className="px-0" onClick={() => setCard(item)}>Read the explanation <BookOpen /></Button></Card>)}</div>{!matches.length && <p className="py-12 text-center text-muted-foreground">No matching explanation in this small starter guide.</p>}<IngredientDialog card={card} onClose={() => setCard(null)} /></>;
}
