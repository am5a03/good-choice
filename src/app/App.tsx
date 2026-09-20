import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, Bookmark, ChevronRight, Leaf, LockKeyhole, Settings, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShelf } from '@/features/shelf/store';
import { ComparisonPage } from '@/features/comparison/comparison-page';
import { CatalogPage } from '@/features/catalog/catalog-page';
import { ShelfPage } from '@/features/shelf/shelf-page';
import { SettingsPage } from '@/features/shelf/settings-page';
import { GuidePage } from '@/features/guide/guide-page';
import { cn } from '@/lib/utils';

const navigation = [
  { path: '/shop', label: 'The grocery aisle', mobile: 'Shop', icon: ShoppingBag },
  { path: '/compare', label: 'Compare products', mobile: 'Compare', icon: SlidersHorizontal },
  { path: '/shelf', label: 'My shelf', mobile: 'My shelf', icon: Bookmark },
  { path: '/guide', label: 'Ingredient guide', mobile: 'Learn', icon: BookOpen },
];
function Brand() { return <NavLink to="/shop" className="brand flex items-center gap-2 text-primary"><span className="flex size-8 -rotate-3 items-center justify-center rounded-[10px_10px_10px_3px] bg-primary text-[#d6e8b4]"><Leaf className="size-5" /></span>goodchoice</NavLink>; }
function Layout() {
  const { state, storageError } = useShelf();
  const location = useLocation();
  return <div className="min-h-dvh">
    <a href="#main" className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-primary p-3 text-white focus:not-sr-only">Skip to content</a>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-[#f2f4eb] px-5 py-8 lg:flex">
      <Brand /><p className="mb-12 mt-2 text-[10px] text-muted-foreground">A little clarity. A better everyday.</p><p className="eyebrow mb-3 px-3">Your kitchen</p>
      <nav aria-label="Main navigation" className="space-y-1.5">{navigation.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-3.5 text-xs font-medium transition-colors', isActive ? 'bg-primary text-white' : 'text-[#687660] hover:bg-accent')}><Icon className="size-[18px]" />{label}{path === '/compare' && <span className="ml-auto rounded bg-current/10 px-1.5 text-[10px]">{state.selected.length}</span>}</NavLink>)}</nav>
      <div className="mt-auto space-y-5 pt-8"><div className="rounded-2xl border border-[#dce3d1] bg-[#ebefdf] p-4"><Leaf className="mb-3 size-6 text-[#71894a]" /><h2 className="mb-2 text-xs font-semibold">No scores. Just clarity.</h2><p className="text-[11px] leading-5 text-muted-foreground">What matters to you should matter to your comparison.</p><NavLink to="/guide" className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium text-primary">Our approach <ArrowRight className="size-3" /></NavLink></div><p className="flex items-center gap-2 text-[10px] text-muted-foreground"><LockKeyhole className="size-3" />Local shelf · D1 catalog</p></div>
    </aside>
    <div className="min-w-0 lg:ml-60"><header className="flex h-20 items-center justify-between gap-3 border-b px-5 sm:px-8 lg:px-10"><div className="lg:hidden"><Brand /></div><div className="hidden items-center gap-3 text-xs text-muted-foreground lg:flex">Your kitchen <ChevronRight className="size-3" /><span>{navigation.find((item) => item.path === location.pathname)?.label ?? 'Settings'}</span></div><div className="flex items-center gap-3"><span className="hidden text-[10px] text-muted-foreground sm:block">Canada · CAD</span><Badge variant="outline" className="rounded-md">Demo catalog</Badge><Button asChild variant="ghost" size="icon"><NavLink to="/settings" aria-label="Settings"><Settings /></NavLink></Button></div></header>
      {storageError && <p role="alert" className="bg-amber-50 px-6 py-3 text-sm text-amber-900">Browser storage is unavailable. Your changes will last only for this session. Export your shelf to keep a copy.</p>}
      <main id="main" className="mx-auto max-w-[1480px] px-5 pb-40 pt-8 sm:px-8 lg:px-10 lg:pb-24" tabIndex={-1}><Outlet /></main>
    </div>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-background/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">{navigation.map(({ path, mobile, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => cn('flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[10px]', isActive ? 'font-semibold text-primary' : 'text-muted-foreground')}><Icon className="size-5" />{mobile}</NavLink>)}</nav>
  </div>;
}
export function App() {
  return <Routes><Route element={<Layout />}><Route index element={<Navigate to="/compare" replace />} /><Route path="compare" element={<ComparisonPage />} /><Route path="shop" element={<CatalogPage />} /><Route path="shelf" element={<ShelfPage />} /><Route path="guide" element={<GuidePage />} /><Route path="settings" element={<SettingsPage />} /><Route path="*" element={<div className="space-y-4"><h1 className="page-title">This aisle does not exist.</h1><Button asChild><NavLink to="/shop">Back to the groceries</NavLink></Button></div>} /></Route></Routes>;
}
