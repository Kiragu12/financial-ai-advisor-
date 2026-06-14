import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'default' | 'ghost';
type Size = 'default' | 'sm' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  default: '',
  ghost: 'btn-ghost',
};

const sizeClass: Record<Size, string> = {
  default: '',
  sm: 'btn-sm',
  icon: 'btn-icon',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'btn',
        variantClass[variant],
        sizeClass[size],
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
