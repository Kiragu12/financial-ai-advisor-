import { Plus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useCreateWallet } from '../../api/hooks/use-wallets';
import type { WalletType } from '../../api/types';
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

// Values match the backend wallet type enum.
const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: 'mobile_money', label: 'M-Pesa / Mobile money' },
  { value: 'bank', label: 'Bank account' },
  { value: 'cash', label: 'Cash' },
  { value: 'savings', label: 'Savings' },
];

interface AddWalletDialogProps {
  trigger?: ReactNode;
}

export function AddWalletDialog({ trigger }: AddWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('mobile_money');
  const [openingBalance, setOpeningBalance] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const createWallet = useCreateWallet();

  function reset() {
    setName('');
    setType('mobile_money');
    setOpeningBalance('');
    setNameError(null);
    createWallet.reset();
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
    createWallet.mutate(
      {
        name: name.trim(),
        type,
        openingBalance: openingBalance.trim() === '' ? 0 : Number(openingBalance),
      },
      { onSuccess: () => handleOpenChange(false) },
    );
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
              onChange={(event) => setType(event.target.value as WalletType)}
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

          {createWallet.isError ? (
            <Alert variant="error" title="Could not create wallet">
              {createWallet.error instanceof Error
                ? createWallet.error.message
                : 'Please try again.'}
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={createWallet.isPending}>
              Create wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
