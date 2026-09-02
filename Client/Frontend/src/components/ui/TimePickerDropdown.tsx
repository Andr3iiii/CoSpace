import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TimePickerDropdownProps {
  value: string; // 'HH:mm' 24-hour format e.g. '09:00'
  onChange: (timeStr: string) => void;
  label?: string;
  className?: string;
}

export const TimePickerDropdown: React.FC<TimePickerDropdownProps> = ({
  value = '09:00',
  onChange,
  label = 'Start with',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current hour and minute
  const [hoursStr, minsStr] = (value || '09:00').split(':');
  const initialHour = parseInt(hoursStr, 10);
  const isPMInitial = initialHour >= 12;
  const [period, setPeriod] = useState<'AM' | 'PM'>(isPMInitial ? 'PM' : 'AM');

  useEffect(() => {
    if (value) {
      const [h] = value.split(':');
      const hourNum = parseInt(h, 10);
      setPeriod(hourNum >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

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

  // Generate 30-min interval slots for the selected AM/PM period
  const generateSlots = (p: 'AM' | 'PM') => {
    const slots = [];

    for (let h = (p === 'AM' ? 6 : 12); h <= (p === 'AM' ? 11 : 22); h++) {
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const hourPadded = String(displayHour).padStart(2, '0');
      const militaryHour = String(h).padStart(2, '0');

      slots.push({
        display: `${hourPadded}:00`,
        value24: `${militaryHour}:00`,
      });
      slots.push({
        display: `${hourPadded}:30`,
        value24: `${militaryHour}:30`,
      });
    }
    return slots;
  };

  const handleSelectSlot = (slotValue24: string) => {
    onChange(slotValue24);
    setIsOpen(false);
  };

  // Convert 24-hr value to 12-hr display for trigger button
  const formatDisplayTime = (val24: string) => {
    if (!val24) return '09:00 AM';
    const [h, m] = val24.split(':');
    const hourNum = parseInt(h, 10);
    const p = hourNum >= 12 ? 'PM' : 'AM';
    const displayH = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${String(displayH).padStart(2, '0')}:${m} ${p}`;
  };

  const slots = generateSlots(period);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${isOpen ? 'z-50' : 'z-20'} ${className}`}
    >
      {/* Trigger Button Matching Reference UI */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all text-left bg-card hover:bg-muted/30 cursor-pointer ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10'
            : 'border-border/80 hover:border-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
            <span className="text-sm font-black text-foreground tracking-tight leading-snug">
              {formatDisplayTime(value)}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Time Picker Popup Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[220px] p-3 rounded-2xl bg-[#0F172A] border border-border shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in-50 zoom-in-95">
          {/* AM / PM Toggle Header */}
          <div className="flex items-center rounded-xl bg-muted/50 p-1 mb-2">
            <button
              type="button"
              onClick={() => setPeriod('AM')}
              className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                period === 'AM'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setPeriod('PM')}
              className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                period === 'PM'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              PM
            </button>
          </div>

          {/* Time Slot Items */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {slots.map((slot) => {
              const isSelected = value === slot.value24;
              return (
                <button
                  key={slot.value24}
                  type="button"
                  onClick={() => handleSelectSlot(slot.value24)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white font-black shadow-sm'
                      : 'text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span>{slot.display}</span>
                  <span className="text-[10px] opacity-70">{period}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
