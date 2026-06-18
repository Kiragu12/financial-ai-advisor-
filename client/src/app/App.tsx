import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Advisor } from '../pages/Advisor';
import { Dashboard } from '../pages/Dashboard';
import { Goals } from '../pages/Goals';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { NotReady } from '../pages/NotReady';
import { Register } from '../pages/Register';
import { Sandbox } from '../pages/Sandbox';
import { Transactions } from '../pages/Transactions';
import { Wallets } from '../pages/Wallets';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/advisor" element={<Advisor />} />
          </Route>
          <Route path="*" element={<NotReady />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
