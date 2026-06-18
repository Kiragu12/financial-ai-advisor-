import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

// Money is kept as a decimal string at all times — never coerced to Number for
// arithmetic. The input restricts characters to digits + a single decimal point
// and emits the raw string via the standard `onChange` event.

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
  currency?: string;
}

const MONEY_PATTERN = '\\d+(\\.\\d{1,2})?';

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { className, invalid, currency = 'KES', onChange, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-card-sm border border-line bg-surface focus-within:shadow-ring',
        invalid && 'border-expense focus-within:shadow-[0_0_0_4px_var(--expense-soft)]',
        className,
      )}
    >
      <span className="grid place-items-center border-r border-line bg-surface-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
        {currency}
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        pattern={MONEY_PATTERN}
        autoComplete="off"
        aria-invalid={invalid || props['aria-invalid']}
        className="num h-10 w-full bg-transparent px-3 text-sm tabular-nums text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed disabled:opacity-60"
        placeholder="0.00"
        onChange={(event) => {
          const sanitized = event.target.value.replace(/[^\d.]/g, '');
          if (sanitized !== event.target.value) {
            event.target.value = sanitized;
          }
          onChange?.(event);
        }}
        {...props}
      />
    </div>
  );
});
