import { Plus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useCreateTransaction } from '../../api/hooks/use-transactions';
import { useWallets } from '../../api/hooks/use-wallets';
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
import { ErrorText, Field, HelperText } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { todayIso } from '../../lib/date';
import { CategoryPicker } from '../categories/CategoryPicker';

type Direction = 'expense' | 'income';

interface AddTransactionDialogProps {
  trigger?: ReactNode;
  defaultDirection?: Direction;
}

export function AddTransactionDialog({
  trigger,
  defaultDirection = 'expense',
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>(defaultDirection);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso);
  const [amountError, setAmountError] = useState<string | null>(null);

  const { data: wallets = [] } = useWallets();
  const createTransaction = useCreateTransaction();

  // Default to the first wallet until the user picks one.
  const effectiveWalletId = walletId || wallets[0]?.id || '';

  function reset() {
    setDirection(defaultDirection);
    setAmount('');
    setWalletId('');
    setCategoryId('');
    setNote('');
    setDate(todayIso());
    setAmountError(null);
    createTransaction.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount.trim() === '' || Number(amount) <= 0) {
      setAmountError('Enter an amount greater than zero.');
      return;
    }
    if (!effectiveWalletId) return;
    setAmountError(null);
    createTransaction.mutate(
      {
        walletId: effectiveWalletId,
        type: direction,
        amount: Number(amount),
        categoryId: categoryId || undefined,
        description: note.trim() || undefined,
        transactionDate: date,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  const noWallets = wallets.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="primary" leftIcon={<Plus size={16} />}>
            Add transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="New transaction"
          title="Log an income or expense"
          description="Pick a wallet, an amount and (optionally) a category."
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
            <Label htmlFor="tx-amount">Amount</Label>
            <MoneyInput
              id="tx-amount"
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
            <Label htmlFor="tx-wallet">Wallet</Label>
            <select
              id="tx-wallet"
              className="input"
              value={effectiveWalletId}
              onChange={(event) => setWalletId(event.target.value)}
              disabled={noWallets}
            >
              {noWallets ? (
                <option>Add a wallet first</option>
              ) : (
                wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))
              )}
            </select>
            {noWallets ? (
              <HelperText>You need at least one wallet before logging a transaction.</HelperText>
            ) : null}
          </Field>

          <CategoryPicker
            id="tx-category"
            type={direction}
            value={categoryId}
            onChange={setCategoryId}
          />

          <Field>
            <Label htmlFor="tx-date">Date</Label>
            <Input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="tx-note">Note (optional)</Label>
            <Input
              id="tx-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. campus lunch"
            />
          </Field>

          {createTransaction.isError ? (
            <Alert variant="error" title="Could not save transaction">
              {createTransaction.error instanceof Error
                ? createTransaction.error.message
                : 'Please try again.'}
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={createTransaction.isPending}
              disabled={noWallets}
            >
              Save transaction
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
