import { ArrowLeftRight } from 'lucide-react';
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

interface TransferDialogProps {
  trigger?: ReactNode;
}

export function TransferDialog({ trigger }: TransferDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  function reset() {
    setAmount('');
    setNote('');
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
          <Button variant="ghost" leftIcon={<ArrowLeftRight size={16} />}>
            Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="Move money"
          title="Transfer between wallets"
          description="Atomic paired movement — the backend enforces sufficient funds when this endpoint ships."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <Label htmlFor="transfer-from">From</Label>
            <select id="transfer-from" className="input" disabled>
              <option>No wallets available yet</option>
            </select>
          </Field>

          <Field>
            <Label htmlFor="transfer-to">To</Label>
            <select id="transfer-to" className="input" disabled>
              <option>No wallets available yet</option>
            </select>
            <HelperText>Both pickers fill in once GET /api/wallets ships.</HelperText>
          </Field>

          <Field>
            <Label htmlFor="transfer-amount">Amount</Label>
            <MoneyInput
              id="transfer-amount"
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
            <Label htmlFor="transfer-note">Note (optional)</Label>
            <Input
              id="transfer-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. moving rent from M-Pesa to bank"
            />
          </Field>

          {submitted ? (
            <Alert variant="info" title="Backend not ready">
              The transfer endpoint goes live once Paul ships{' '}
              <code className="font-mono">POST /api/transfers</code>.
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
