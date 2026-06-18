import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Landing } from './Landing';

describe('Landing', () => {
  it('renders the hero headline and the primary CTAs', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /track every shilling/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.getByRole('link', { name: /^log in$/i })).toHaveAttribute('href', '/login');
  });
});
