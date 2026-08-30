import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', message, onClose, className }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/20';
      case 'error':
        return 'border-destructive/30 bg-destructive/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/20';
      default:
        return 'border-border bg-card/90';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md text-sm text-foreground transition-all duration-200 animate-in fade-in-0 slide-in-from-top-2',
        getBorderColor(),
        className
      )}
    >
      {getIcon()}
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
