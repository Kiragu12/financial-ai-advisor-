import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Login } from './Login';

describe('Login', () => {
  it('shows the honest "backend not ready" alert after submit', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), 'student@strathmore.edu');
    await user.type(screen.getByLabelText(/password/i), 'supersecret');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/backend not ready/i)).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/auth\/login/i)).toBeInTheDocument();
  });

  it('links to the registration page for new users', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
