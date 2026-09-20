import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { App } from './app/App';
import { ShelfProvider } from './features/shelf/store';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } } });
createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><ShelfProvider><App /><Toaster richColors position="top-center" /></ShelfProvider></BrowserRouter></QueryClientProvider></StrictMode>,
);
