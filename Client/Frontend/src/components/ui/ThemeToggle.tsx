import React from 'react';
import { useTheme } from '../../stores/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center p-2 rounded-xl border border-border/80 bg-card/60 text-foreground hover:bg-muted/70 hover:border-border transition-all duration-200 cursor-pointer shadow-sm group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun icon for dark mode (click to switch to light) */}
        <Sun
          className={cn(
            'h-5 w-5 text-amber-400 transition-all duration-300 absolute transform',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          )}
        />
        {/* Moon icon for light mode (click to switch to dark) */}
        <Moon
          className={cn(
            'h-5 w-5 text-indigo-500 transition-all duration-300 absolute transform',
            isDark
              ? '-rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold select-none text-muted-foreground group-hover:text-foreground">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
