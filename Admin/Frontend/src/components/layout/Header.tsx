import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search resources..."
            className="h-9 w-52 rounded-lg border border-border bg-background/50 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Notifications Icon */}
        <Button variant="outline" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
};
