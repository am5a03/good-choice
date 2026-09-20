import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { toast } from 'sonner';
import { decodeShelf, defaultShelf, type Shelf } from '@shared/shelf';

const KEY = 'goodchoice-v2';
const Context = createContext<{ state: Shelf; setState: Dispatch<SetStateAction<Shelf>>; storageError: boolean; toggleSelected: (id: string) => void; toggleSaved: (id: string) => void } | null>(null);
export function ShelfProvider({ children }: { children: ReactNode }) {
  const [storageError, setStorageError] = useState(false);
  const [state, setState] = useState<Shelf>(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem('goodchoice-prototype-v1');
      return raw ? decodeShelf(JSON.parse(raw)) : defaultShelf();
    } catch { return defaultShelf(); }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state]);
  const toggleSelected = (id: string) => {
    if (!state.selected.includes(id) && state.selected.length >= 4) { toast.info('Compare up to four products at a time.'); return; }
    setState((previous) => ({ ...previous, selected: previous.selected.includes(id) ? previous.selected.filter((value) => value !== id) : [...previous.selected, id] }));
  };
  const toggleSaved = (id: string) => setState((previous) => ({ ...previous, saved: previous.saved.includes(id) ? previous.saved.filter((value) => value !== id) : [...previous.saved, id] }));
  return <Context.Provider value={{ state, setState, storageError, toggleSelected, toggleSaved }}>{children}</Context.Provider>;
}
export function useShelf() { const value = useContext(Context); if (!value) throw new Error('ShelfProvider is missing.'); return value; }
export function exportShelf(state: Shelf) {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ app: 'GoodChoice', notice: 'Demo and manually entered data; photos are excluded.', exported: new Date().toISOString(), settings: state }, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'goodchoice-my-shelf.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
