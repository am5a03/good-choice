import { useState, type FormEvent } from 'react';
import type { Product } from '@shared/models';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export function ScanDialog({ open, onClose, onMatch, onManual }: { open: boolean; onClose: () => void; onMatch: (product: Product) => void; onManual: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [code, setCode] = useState('');
  async function lookup(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); try { const product = await api.barcode(code); onClose(); onMatch(product); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Lookup failed.'); } finally { setBusy(false); } }
  return <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}><DialogContent><DialogHeader><DialogTitle>Find a product by barcode.</DialogTitle><DialogDescription>This catalog contains sample codes DEMO001–DEMO008. Camera scanning and external product lookup are not connected.</DialogDescription></DialogHeader><form onSubmit={lookup} className="space-y-4"><Input aria-label="Barcode" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Try DEMO002" maxLength={80} required autoComplete="off" /><Button className="w-full" disabled={busy} type="submit">{busy ? 'Looking up…' : 'Look up barcode'}</Button></form>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button variant="outline" onClick={() => { onClose(); onManual(); }}>Not in the catalog? Add a label</Button></DialogContent></Dialog>;
}
