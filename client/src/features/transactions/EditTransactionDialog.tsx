import { useState, type FormEvent, type ReactNode } from 'react';
import { useUpdateTransaction } from '../../api/hooks/use-transactions';
import { useWallets } from '../../api/hooks/use-wallets';
import type { Transaction } from '../../api/types';
import { MoneyInput } from '../../components/finance/MoneyInput';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../components/ui/dialog';
import { ErrorText, Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CategoryPicker } from '../categories/CategoryPicker';

type Direction = 'expense' | 'income';

interface EditTransactionDialogProps {
  transaction: Transaction;
  trigger: ReactNode;
}

/**
 * Edit an existing income/expense transaction. Pre-filled from the transaction;
 * the backend re-adjusts wallet balances atomically on save. (Transfer legs are
 * never passed here — the Transactions page only offers Edit on non-transfers.)
 */
export function EditTransactionDialog({ transaction, trigger }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>(
    transaction.type === 'income' ? 'income' : 'expense',
  );
  const [amount, setAmount] = useState(String(transaction.amount));
  const [walletId, setWalletId] = useState(transaction.walletId);
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? '');
  const [note, setNote] = useState(transaction.description ?? '');
  const [date, setDate] = useState(transaction.transactionDate);
  const [amountError, setAmountError] = useState<string | null>(null);

  const { data: wallets = [] } = useWallets();
  const updateTransaction = useUpdateTransaction();

  // Re-seed the form from the transaction whenever the dialog is (re)opened.
  function seed() {
    setDirection(transaction.type === 'income' ? 'income' : 'expense');
    setAmount(String(transaction.amount));
    setWalletId(transaction.walletId);
    setCategoryId(transaction.categoryId ?? '');
    setNote(transaction.description ?? '');
    setDate(transaction.transactionDate);
    setAmountError(null);
    updateTransaction.reset();
  }

  function handleOpenChange(next: boolean) {
    if (next) seed();
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount.trim() === '' || Number(amount) <= 0) {
      setAmountError('Enter an amount greater than zero.');
      return;
    }
    setAmountError(null);
    updateTransaction.mutate(
      {
        transactionId: transaction.id,
        walletId,
        type: direction,
        amount: Number(amount),
        categoryId: categoryId || null, // empty selection clears the category
        description: note.trim() || null,
        transactionDate: date,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="Edit transaction"
          title="Update this entry"
          description="Changing the amount, type or wallet re-adjusts your balances automatically."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <span className="text-sm font-medium text-ink">Type</span>
            <div className="flex gap-2 rounded-card-sm border border-line bg-surface-2 p-1">
              <DirectionToggle
                active={direction === 'expense'}
                onClick={() => {
                  setDirection('expense');
                  setCategoryId('');
                }}
                label="Expense"
              />
              <DirectionToggle
                active={direction === 'income'}
                onClick={() => {
                  setDirection('income');
                  setCategoryId('');
                }}
                label="Income"
              />
            </div>
          </Field>

          <Field>
            <Label htmlFor="edit-tx-amount">Amount</Label>
            <MoneyInput
              id="edit-tx-amount"
              autoFocus
              required
              value={amount}
              invalid={amountError !== null}
              onChange={(event) => {
                setAmount(event.target.value);
                if (amountError) setAmountError(null);
              }}
            />
            {amountError ? <ErrorText>{amountError}</ErrorText> : null}
          </Field>

          <Field>
            <Label htmlFor="edit-tx-wallet">Wallet</Label>
            <select
              id="edit-tx-wallet"
              className="input"
              value={walletId}
              onChange={(event) => setWalletId(event.target.value)}
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </Field>

          <CategoryPicker
            id="edit-tx-category"
            type={direction}
            value={categoryId}
            onChange={setCategoryId}
          />

          <Field>
            <Label htmlFor="edit-tx-date">Date</Label>
            <Input
              id="edit-tx-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="edit-tx-note">Note (optional)</Label>
            <Input
              id="edit-tx-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. campus lunch"
            />
          </Field>

          {updateTransaction.isError ? (
            <Alert variant="error" title="Could not update transaction">
              {updateTransaction.error instanceof Error
                ? updateTransaction.error.message
                : 'Please try again.'}
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={updateTransaction.isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DirectionToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-card-sm px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-surface text-ink shadow-token-sm' : 'text-ink-3 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
