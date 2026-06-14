import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/cn';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuPortal = DropdownPrimitive.Portal;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-card-sm border border-line bg-surface p-1 text-ink shadow-token-lg',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(function DropdownMenuItem({ className, ...props }, ref) {
  return (
    <DropdownPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-card-sm px-2.5 py-2 text-sm text-ink outline-none',
        'transition-colors',
        'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return (
    <DropdownPrimitive.Label
      ref={ref}
      className={cn(
        'px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3',
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownPrimitive.Separator
      ref={ref}
      className={cn('my-1 h-px bg-line', className)}
      {...props}
    />
  );
});
