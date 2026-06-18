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

const WALLET_TYPES = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank account' },
  { value: 'cash', label: 'Cash' },
  { value: 'savings', label: 'Savings' },
] as const;

interface AddWalletDialogProps {
  trigger?: ReactNode;
}

export function AddWalletDialog({ trigger }: AddWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof WALLET_TYPES)[number]['value']>('mpesa');
  const [openingBalance, setOpeningBalance] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  function reset() {
    setName('');
    setType('mpesa');
    setOpeningBalance('');
    setNameError(null);
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length === 0) {
      setNameError('Give the wallet a name.');
      return;
    }
    setNameError(null);
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="primary" leftIcon={<Plus size={16} />}>
            Add wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="New wallet"
          title="Add a wallet"
          description="Tell Akiba about one of your accounts — M-Pesa, a bank, cash or a savings stash."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <Label htmlFor="wallet-name">Name</Label>
            <Input
              id="wallet-name"
              autoFocus
              required
              value={name}
              invalid={nameError !== null}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Equity current"
            />
            {nameError ? <ErrorText>{nameError}</ErrorText> : null}
          </Field>

          <Field>
            <Label htmlFor="wallet-type">Type</Label>
            <select
              id="wallet-type"
              value={type}
              onChange={(event) => setType(event.target.value as typeof type)}
              className="input"
            >
              {WALLET_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <Label htmlFor="wallet-opening-balance">Opening balance (optional)</Label>
            <MoneyInput
              id="wallet-opening-balance"
              value={openingBalance}
              onChange={(event) => setOpeningBalance(event.target.value)}
            />
            <HelperText>Leave blank for 0.00 — you can log transactions to update it.</HelperText>
          </Field>

          {submitted ? (
            <Alert variant="info" title="Backend not ready">
              The wallet endpoint goes live once Paul ships{' '}
              <code className="font-mono">POST /api/wallets</code>. Form is wired and waiting.
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
