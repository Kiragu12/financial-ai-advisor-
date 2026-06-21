import { useState, type FormEvent, type ReactNode } from 'react';
import { useContribute } from '../../api/hooks/use-goals';
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

interface ContributeDialogProps {
  goalId: string;
  goalName: string;
  trigger: ReactNode;
}

export function ContributeDialog({ goalId, goalName, trigger }: ContributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(''); // '' = manual (no wallet)
  const [note, setNote] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  const { data: wallets = [] } = useWallets();
  const contribute = useContribute();

  function reset() {
    setAmount('');
    setWalletId('');
    setNote('');
    setAmountError(null);
    contribute.reset();
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
    contribute.mutate(
      {
        goalId,
        amount: Number(amount),
        walletId: walletId || undefined,
        note: note.trim() || undefined,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="Add to goal"
          title={`Contribute to ${goalName}`}
          description="Draw from a wallet (the balance is debited) or record a manual contribution."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <Label htmlFor="contrib-amount">Amount</Label>
            <MoneyInput
              id="contrib-amount"
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
            <Label htmlFor="contrib-wallet">Source</Label>
            <select
              id="contrib-wallet"
              className="input"
              value={walletId}
              onChange={(event) => setWalletId(event.target.value)}
            >
              <option value="">Manual (no wallet)</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            <HelperText>
              Choosing a wallet moves real money out of it; manual just tracks progress.
            </HelperText>
          </Field>

          <Field>
            <Label htmlFor="contrib-note">Note (optional)</Label>
            <Input
              id="contrib-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. saved from this month's allowance"
            />
          </Field>

          {contribute.isError ? (
            <Alert variant="error" title="Could not contribute">
              {contribute.error instanceof Error ? contribute.error.message : 'Please try again.'}
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={contribute.isPending}>
              Contribute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
