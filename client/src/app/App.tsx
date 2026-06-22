import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Spinner } from '../components/ui/spinner';
import { AuthProvider } from '../features/auth/AuthContext';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { NotReady } from '../pages/NotReady';
import { Register } from '../pages/Register';

// Heavier authenticated screens load on demand so the public Landing/Login
// chunks stay small. Each named-import re-export keeps tree-shaking simple.
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Wallets = lazy(() => import('../pages/Wallets').then((m) => ({ default: m.Wallets })));
const Transactions = lazy(() =>
  import('../pages/Transactions').then((m) => ({ default: m.Transactions })),
);
const Goals = lazy(() => import('../pages/Goals').then((m) => ({ default: m.Goals })));
const Advisor = lazy(() => import('../pages/Advisor').then((m) => ({ default: m.Advisor })));

// Sandbox is a dev-only design reference — keep it out of production bundles.
const Sandbox = import.meta.env.DEV
  ? lazy(() => import('../pages/Sandbox').then((m) => ({ default: m.Sandbox })))
  : null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RouteFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Spinner size={24} label="Loading page" />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {Sandbox ? <Route path="/sandbox" element={<Sandbox />} /> : null}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/wallets" element={<Wallets />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/advisor" element={<Advisor />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotReady />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
