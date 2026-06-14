import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { NotReady } from '../pages/NotReady';
import { Sandbox } from '../pages/Sandbox';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="*" element={<NotReady />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
