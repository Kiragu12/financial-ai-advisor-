import type { WalletType } from '../../api/types';

// Values match the backend wallet type enum.
export const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: 'mobile_money', label: 'M-Pesa / Mobile money' },
  { value: 'bank', label: 'Bank account' },
  { value: 'cash', label: 'Cash' },
  { value: 'savings', label: 'Savings' },
  { value: 'custom', label: 'Custom' },
];
