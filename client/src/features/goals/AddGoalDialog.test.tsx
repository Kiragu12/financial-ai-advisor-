import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AddGoalDialog } from './AddGoalDialog';

describe('AddGoalDialog', () => {
  it('requires a name and a positive target, then shows the backend-not-ready alert', async () => {
    const user = userEvent.setup();
    render(<AddGoalDialog />);

    await user.click(screen.getByRole('button', { name: /add goal/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create goal/i }));
    expect(await screen.findByText(/give the goal a name/i)).toBeInTheDocument();
    expect(screen.getByText(/set a target greater than zero/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), 'New laptop');
    await user.type(screen.getByLabelText(/target/i), '80000');
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    expect(await screen.findByText(/backend not ready/i)).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/goals/i)).toBeInTheDocument();
  });
});
