import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check, Wrench, Clock, X } from 'lucide-react';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border transition-all duration-150 select-none h-fit w-fit self-start capitalize',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90',
        secondary: 'border-border bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-red-600 text-white font-semibold hover:bg-red-700',
        danger: 'border-transparent bg-red-600 text-white font-semibold hover:bg-red-700',
        outline: 'text-foreground border-border bg-transparent',

        // 🌟 Status Badges (Adaptive Dual-Mode)
        available: 'border-emerald-500 text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold shadow-sm',
        maintenance: 'border-amber-500 text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 font-bold shadow-sm',
        confirm: 'border-emerald-500 text-emerald-700 bg-emerald-50/60 dark:bg-transparent dark:text-emerald-400 font-semibold',
        confirmed: 'border-emerald-500 text-emerald-700 bg-emerald-50/60 dark:bg-transparent dark:text-emerald-400 font-semibold',
        pending: 'border-amber-500 text-amber-800 bg-amber-50/60 dark:bg-transparent dark:border-yellow-400 dark:text-yellow-400 font-semibold',
        cancelled: 'border-red-500 text-red-700 bg-red-50/60 dark:bg-transparent dark:text-red-400 font-semibold',
        canceled: 'border-red-500 text-red-700 bg-red-50/60 dark:bg-transparent dark:text-red-400 font-semibold',
        completed: 'border-sky-500 text-sky-700 bg-sky-50/60 dark:bg-transparent dark:border-sky-400 dark:text-sky-400 font-semibold',
        active: 'border-emerald-500 text-emerald-700 bg-emerald-50/60 dark:bg-transparent dark:text-emerald-400 font-semibold',

        // Solid Variants (Soft pastel on light, deep luxury tones on dark)
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950 dark:text-emerald-300 font-semibold',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950 dark:text-amber-300 font-semibold',
        info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-950 dark:text-sky-300 font-semibold',
        neutral: 'border-border bg-card text-foreground font-semibold',
        indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-950 dark:text-indigo-300 font-semibold',
        purple: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-500/40 dark:bg-purple-950 dark:text-purple-300 font-semibold',
        rose: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-950 dark:text-rose-300 font-semibold',
      },
      size: {
        default: 'px-3 py-1 text-sm font-semibold',
        sm: 'px-2.5 py-0.5 text-xs font-medium',
        lg: 'px-4 py-1.5 text-base font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status:
    | 'available'
    | 'maintenance'
    | 'confirm'
    | 'confirmed'
    | 'pending'
    | 'cancelled'
    | 'canceled'
    | 'completed'
    | 'active'
    | string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, size, showIcon = true, ...props }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();
  let variant:
    | 'available'
    | 'maintenance'
    | 'confirm'
    | 'confirmed'
    | 'pending'
    | 'cancelled'
    | 'outline' = 'outline';
  let icon: React.ReactNode = null;

  if (normalized === 'available') {
    variant = 'available';
    icon = <Check className="h-3.5 w-3.5 shrink-0 text-emerald-700" />;
  } else if (normalized === 'maintenance') {
    variant = 'maintenance';
    icon = <Wrench className="h-3.5 w-3.5 shrink-0 text-amber-700" />;
  } else if (
    normalized === 'confirm' ||
    normalized === 'confirmed' ||
    normalized === 'active' ||
    normalized === 'completed'
  ) {
    variant = 'confirmed';
    icon = <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
  } else if (normalized === 'pending' || normalized === 'waiting') {
    variant = 'pending';
    icon = <Clock className="h-3.5 w-3.5 shrink-0 text-yellow-400" />;
  } else if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'rejected') {
    variant = 'cancelled';
    icon = <X className="h-3.5 w-3.5 shrink-0 text-red-400" />;
  }

  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <Badge
      variant={variant}
      size={size}
      className={cn('gap-1.5 inline-flex items-center', className)}
      {...props}
    >
      {showIcon && icon}
      <span>{props.children || label}</span>
    </Badge>
  );
}
