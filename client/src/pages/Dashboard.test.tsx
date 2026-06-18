import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders the full layout with empty states for every data section', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    // "Aggregate balance" appears in the KPI label and the page description copy.
    expect(screen.getAllByText(/aggregate balance/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no category data yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no goals yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no insights yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/transactions');
    expect(screen.getByRole('link', { name: /open advisor/i })).toHaveAttribute('href', '/advisor');
  });
});
