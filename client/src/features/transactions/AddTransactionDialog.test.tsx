import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AddTransactionDialog } from './AddTransactionDialog';

describe('AddTransactionDialog', () => {
  it('rejects zero amounts and surfaces the backend-not-ready alert on a valid submit', async () => {
    const user = userEvent.setup();
    render(<AddTransactionDialog />);

    await user.click(screen.getByRole('button', { name: /add transaction/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save transaction/i }));
    expect(await screen.findByText(/amount greater than zero/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/amount/i), '450');
    await user.click(screen.getByRole('button', { name: /save transaction/i }));

    expect(await screen.findByText(/backend not ready/i)).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/transactions/i)).toBeInTheDocument();
  });
});
