import { ArrowLeftRight } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useCreateTransfer } from '../../api/hooks/use-transfers';
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

interface TransferDialogProps {
  trigger?: ReactNode;
}

export function TransferDialog({ trigger }: TransferDialogProps) {
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: wallets = [] } = useWallets();
  const createTransfer = useCreateTransfer();

  // Default source/destination to the first two distinct wallets.
  const effectiveFrom = fromId || wallets[0]?.id || '';
  const effectiveTo = toId || wallets.find((w) => w.id !== effectiveFrom)?.id || '';
  const tooFewWallets = wallets.length < 2;

  function reset() {
    setFromId('');
    setToId('');
    setAmount('');
    setNote('');
    setError(null);
    createTransfer.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount.trim() === '' || Number(amount) <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (effectiveFrom === effectiveTo) {
      setError('Source and destination wallets must be different.');
      return;
    }
    setError(null);
    createTransfer.mutate(
      {
        fromWalletId: effectiveFrom,
        toWalletId: effectiveTo,
        amount: Number(amount),
        description: note.trim() || undefined,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" leftIcon={<ArrowLeftRight size={16} />}>
            Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="Move money"
          title="Transfer between wallets"
          description="The backend moves both balances atomically and rejects a transfer that exceeds the source balance."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <Label htmlFor="transfer-from">From</Label>
            <select
              id="transfer-from"
              className="input"
              value={effectiveFrom}
              onChange={(event) => setFromId(event.target.value)}
              disabled={tooFewWallets}
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <Label htmlFor="transfer-to">To</Label>
            <select
              id="transfer-to"
              className="input"
              value={effectiveTo}
              onChange={(event) => setToId(event.target.value)}
              disabled={tooFewWallets}
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            {tooFewWallets ? (
              <HelperText>You need at least two wallets to make a transfer.</HelperText>
            ) : null}
          </Field>

          <Field>
            <Label htmlFor="transfer-amount">Amount</Label>
            <MoneyInput
              id="transfer-amount"
              required
              value={amount}
              invalid={error !== null}
              onChange={(event) => {
                setAmount(event.target.value);
                if (error) setError(null);
              }}
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
          </Field>

          <Field>
            <Label htmlFor="transfer-note">Note (optional)</Label>
            <Input
              id="transfer-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. moving rent from M-Pesa to bank"
            />
          </Field>

          {createTransfer.isError ? (
            <Alert variant="error" title="Could not transfer">
              {createTransfer.error instanceof Error
                ? createTransfer.error.message
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
              loading={createTransfer.isPending}
              disabled={tooFewWallets}
            >
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
