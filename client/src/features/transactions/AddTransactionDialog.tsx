import { Plus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
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

type Direction = 'expense' | 'income';

interface AddTransactionDialogProps {
  trigger?: ReactNode;
  defaultDirection?: Direction;
}

function todayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function AddTransactionDialog({
  trigger,
  defaultDirection = 'expense',
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>(defaultDirection);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso);
  const [submitted, setSubmitted] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  function reset() {
    setDirection(defaultDirection);
    setAmount('');
    setNote('');
    setDate(todayIso());
    setSubmitted(false);
    setAmountError(null);
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
    setAmountError(null);
    setSubmitted(true);
  }

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
          description="Quick entry — categorise it later when those endpoints exist."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <span className="text-sm font-medium text-ink">Type</span>
            <div className="flex gap-2 rounded-card-sm border border-line bg-surface-2 p-1">
              <DirectionToggle
                active={direction === 'expense'}
                onClick={() => setDirection('expense')}
                label="Expense"
              />
              <DirectionToggle
                active={direction === 'income'}
                onClick={() => setDirection('income')}
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
            <select id="tx-wallet" className="input" disabled>
              <option>No wallets available yet</option>
            </select>
            <HelperText>The picker fills in once GET /api/wallets ships.</HelperText>
          </Field>

          <Field>
            <Label htmlFor="tx-category">Category</Label>
            <select id="tx-category" className="input" disabled>
              <option>No categories available yet</option>
            </select>
            <HelperText>Categories arrive with GET /api/categories.</HelperText>
          </Field>

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

          {submitted ? (
            <Alert variant="info" title="Backend not ready">
              The transactions endpoint goes live once Paul ships{' '}
              <code className="font-mono">POST /api/transactions</code>.
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
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
