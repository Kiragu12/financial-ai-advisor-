import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Advisor } from './Advisor';

describe('Advisor', () => {
  it('shows the disclaimer and the empty conversation state by default', () => {
    render(
      <MemoryRouter>
        <Advisor />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /^advisor$/i })).toBeInTheDocument();
    expect(screen.getByText(/educational, not regulated/i)).toBeInTheDocument();
    expect(screen.getByText(/start a conversation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('surfaces the backend-not-ready alert when a message is sent', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Advisor />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/ask the advisor/i), 'Am I overspending?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText(/backend not ready/i)).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/advisor\/messages/i)).toBeInTheDocument();
  });
});
