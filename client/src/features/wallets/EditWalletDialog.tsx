import { useState, type FormEvent, type ReactNode } from 'react';
import { useUpdateWallet } from '../../api/hooks/use-wallets';
import type { Wallet, WalletType } from '../../api/types';
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
import { WALLET_TYPES } from './wallet-options';

interface EditWalletDialogProps {
  wallet: Wallet;
  trigger: ReactNode;
}

export function EditWalletDialog({ wallet, trigger }: EditWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(wallet.name);
  const [type, setType] = useState<WalletType>(wallet.type);
  const [nameError, setNameError] = useState<string | null>(null);

  const updateWallet = useUpdateWallet();

  function resetForm() {
    setName(wallet.name);
    setType(wallet.type);
    setNameError(null);
    updateWallet.reset();
  }

  function handleOpenChange(next: boolean) {
    if (next) resetForm();
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();

    if (nextName.length === 0) {
      setNameError('Give the wallet a name.');
      return;
    }

    setNameError(null);
    updateWallet.mutate(
      {
        walletId: wallet.id,
        name: nextName,
        type,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="Edit wallet"
          title={wallet.name}
          description="Update the wallet name or account type."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <Label htmlFor={`wallet-name-${wallet.id}`}>Name</Label>
            <Input
              id={`wallet-name-${wallet.id}`}
              autoFocus
              required
              value={name}
              invalid={nameError !== null}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
            />
            {nameError ? <ErrorText>{nameError}</ErrorText> : null}
          </Field>

          <Field>
            <Label htmlFor={`wallet-type-${wallet.id}`}>Type</Label>
            <select
              id={`wallet-type-${wallet.id}`}
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

          {updateWallet.isError ? (
            <Alert variant="error" title="Could not update wallet">
              {updateWallet.error instanceof Error
                ? updateWallet.error.message
                : 'Please try again.'}
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={updateWallet.isPending}>
              Save wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
