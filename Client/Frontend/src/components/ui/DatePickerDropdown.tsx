import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerDropdownProps {
  value: string; // 'yyyy-MM-dd'
  onChange: (dateStr: string) => void;
  disabledDates?: string[]; // Array of 'yyyy-MM-dd'
  minDate?: Date;
  label?: string;
  className?: string;
}

export const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  value,
  onChange,
  disabledDates = [],
  minDate = startOfDay(new Date()),
  label = 'Select a day',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Staging date selection before confirming with "Done"
  const initialDate = value ? parseISO(value) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? parseISO(value) : null);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);

  // Synchronize when outer value changes
  useEffect(() => {
    if (value) {
      setSelectedDate(parseISO(value));
      setCurrentMonth(parseISO(value));
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && selectedDate) {
      setCurrentMonth(selectedDate);
    }
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateDisabled = (day: Date) => {
    if (isBefore(day, minDate)) return true;
    const formattedStr = format(day, 'yyyy-MM-dd');
    return disabledDates.includes(formattedStr);
  };

  const handleDateSelect = (day: Date) => {
    if (isDateDisabled(day)) return;
    setSelectedDate(day);
  };

  const handleDone = () => {
    if (selectedDate && !isDateDisabled(selectedDate)) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    // Reset to current committed value and close
    if (value) {
      setSelectedDate(parseISO(value));
    }
    setIsOpen(false);
  };

  // Calendar matrix calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const formattedDisplay = value ? format(parseISO(value), 'dd.MM.yyyy') : 'Choose a date';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${isOpen ? 'z-50' : 'z-20'} ${className}`}
    >
      {/* Trigger Button Matching Reference UI */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all text-left bg-card hover:bg-muted/30 cursor-pointer ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10'
            : 'border-border/80 hover:border-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
            <span className="text-sm font-black text-foreground tracking-tight leading-snug">
              {formattedDisplay}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Calendar Dropdown Card */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] p-4 rounded-3xl bg-[#0F172A] border border-border shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in-50 zoom-in-95">
          {/* Month Header with < > Controls */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-black text-foreground tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header Initials (M T W T F S S) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((d, idx) => (
              <div key={idx} className="text-xs font-bold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const disabled = isDateDisabled(day);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDateSelect(day)}
                  className={`h-9 w-9 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                    !isCurrentMonth
                      ? 'text-muted-foreground/30'
                      : disabled
                      ? 'text-muted-foreground/30 line-through cursor-not-allowed'
                      : isSelected
                      ? 'bg-primary text-white font-black shadow-md shadow-primary/35 scale-105'
                      : today
                      ? 'border border-primary/50 text-primary hover:bg-primary/10'
                      : 'text-foreground hover:bg-muted/60'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Remove/Cancel and Done */}
          <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border/60">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-muted-foreground bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={!selectedDate || isDateDisabled(selectedDate)}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                selectedDate && !isDateDisabled(selectedDate)
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/25'
                  : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed shadow-none'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
