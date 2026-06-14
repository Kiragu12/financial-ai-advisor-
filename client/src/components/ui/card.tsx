import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn('card', padded && 'card-pad', className)} {...props} />
  );
});
