import { Plus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useCategorySuggestion } from '../../api/hooks/use-categoriser';
import { useCreateTransaction } from '../../api/hooks/use-transactions';
import { useWallets } from '../../api/hooks/use-wallets';
import { MoneyInput } from '../../components/finance/MoneyInput';
import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
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
import { AddWalletDialog } from '../wallets/AddWalletDialog';

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
  // Once the user picks a category themselves (even "Uncategorised"), the
  // model's suggestion never overrides it.
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso);
  const [amountError, setAmountError] = useState<string | null>(null);

  const { data: wallets = [] } = useWallets();
  const createTransaction = useCreateTransaction();

  // Default to the first wallet until the user picks one.
  const effectiveWalletId = walletId || wallets[0]?.id || '';

  // The model only classifies expenses. A confident suggestion preselects the
  // category; a weak one is offered as chips. No suggestion = today's form.
  const suggestion = useCategorySuggestion(note, Number(amount), direction === 'expense');
  const suggestionOpen = suggestion !== undefined && !categoryTouched;
  const autoCategoryId =
    suggestionOpen && suggestion.autoAssign ? suggestion.categoryId : null;
  const effectiveCategoryId = categoryTouched ? categoryId : (autoCategoryId ?? '');
  const suggestionChips =
    suggestionOpen && !suggestion.autoAssign
      ? suggestion.alternatives.filter((alt) => alt.categoryId !== null)
      : [];

  function chooseCategory(id: string) {
    setCategoryId(id);
    setCategoryTouched(true);
  }

  function changeDirection(next: Direction) {
    setDirection(next);
    setCategoryId('');
    setCategoryTouched(false);
  }

  function reset() {
    setDirection(defaultDirection);
    setAmount('');
    setWalletId('');
    setCategoryId('');
    setCategoryTouched(false);
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
        categoryId: effectiveCategoryId || undefined,
        description: note.trim() || undefined,
        transactionDate: date,
        predictedCategoryId: suggestion?.categoryId ?? undefined,
        predictionConfidence: suggestion?.categoryId ? suggestion.confidence : undefined,
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
                onClick={() => changeDirection('expense')}
                label="Expense"
              />
              <DirectionToggle
                active={direction === 'income'}
                onClick={() => changeDirection('income')}
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
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="tx-wallet">Wallet</Label>
              <AddWalletDialog
                onCreated={(wallet) => setWalletId(wallet.id)}
                trigger={
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:shadow-ring rounded-card-sm"
                  >
                    + New wallet
                  </button>
                }
              />
            </div>
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
              <HelperText>
                You need at least one wallet before logging a transaction — tap “New wallet” above.
              </HelperText>
            ) : null}
          </Field>

          {suggestionChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-3">Looks like:</span>
              {suggestionChips.map((alt) => (
                <button
                  key={alt.category}
                  type="button"
                  className="rounded-full focus-visible:outline-none focus-visible:shadow-ring"
                  onClick={() => chooseCategory(alt.categoryId!)}
                >
                  <Badge variant="primary">{alt.category}</Badge>
                </button>
              ))}
            </div>
          ) : null}

          <CategoryPicker
            id="tx-category"
            type={direction}
            value={effectiveCategoryId}
            onChange={chooseCategory}
          />
          {autoCategoryId ? (
            <HelperText className="-mt-3">Suggested — change if wrong</HelperText>
          ) : null}

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
