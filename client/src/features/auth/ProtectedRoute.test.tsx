import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>DASH PAGE</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('redirects unauthenticated visitors to /login', () => {
    renderAt('/dashboard');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('DASH PAGE')).not.toBeInTheDocument();
  });

  it('renders the protected child when a token is stored', () => {
    window.localStorage.setItem('akiba.auth.token', 'placeholder-token');
    renderAt('/dashboard');
    expect(screen.getByText('DASH PAGE')).toBeInTheDocument();
    expect(screen.queryByText('LOGIN PAGE')).not.toBeInTheDocument();
  });
});
