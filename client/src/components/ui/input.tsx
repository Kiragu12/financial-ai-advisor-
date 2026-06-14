import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || props['aria-invalid']}
      className={cn(
        'input',
        invalid &&
          'border-expense focus:border-expense focus:shadow-[0_0_0_4px_var(--expense-soft)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
});
