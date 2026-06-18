import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AddWalletDialog } from './AddWalletDialog';

describe('AddWalletDialog', () => {
  it('opens the modal, requires a name, and surfaces the backend-not-ready alert on submit', async () => {
    const user = userEvent.setup();
    render(<AddWalletDialog />);

    await user.click(screen.getByRole('button', { name: /add wallet/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create wallet/i }));
    expect(await screen.findByText(/give the wallet a name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), 'Equity current');
    await user.click(screen.getByRole('button', { name: /create wallet/i }));

    expect(await screen.findByText(/backend not ready/i)).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/wallets/i)).toBeInTheDocument();
  });
});
