import { cn } from '../../lib/cn';

type Size = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: Size;
  className?: string;
}

const sizeClass: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-label={name}
      className={cn(
        'grid shrink-0 place-items-center rounded-pill bg-primary-soft-2 font-semibold text-primary',
        sizeClass[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
