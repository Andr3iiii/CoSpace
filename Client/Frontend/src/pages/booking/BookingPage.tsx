import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { bookingApi } from '../../api/booking.api';
import { useAuth } from '../../stores/AuthContext';
import { Workspace } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DatePickerDropdown } from '../../components/ui/DatePickerDropdown';
import { TimePickerDropdown } from '../../components/ui/TimePickerDropdown';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Percent,
  ShieldAlert,
  X,
  Lock,
} from 'lucide-react';
import { addHours, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export const BookingPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { client } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  // Helper to parse dates in yyyy-MM-dd or dd.MM.yyyy formats safely
  const parseBookingDateTime = (dateStr: string, hourStr: string): Date | null => {
    if (!dateStr || !hourStr) return null;
    try {
      let year = 2026, month = 0, day = 1;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          year = parts[0];
          month = parts[1] - 1;
          day = parts[2];
        } else {
          return null;
        }
      } else if (dateStr.includes('.')) {
        const parts = dateStr.split('.').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          day = parts[0];
          month = parts[1] - 1;
          year = parts[2];
        } else {
          return null;
        }
      } else {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      }

      let hour = 9, min = 0;
      if (hourStr.includes(':')) {
        const [h, m] = hourStr.split(':').map(Number);
        hour = isNaN(h) ? 9 : h;
        min = isNaN(m) ? 0 : m;
      }

      const parsed = new Date(year, month, day, hour, min, 0, 0);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };

  // Compute initial upcoming date and hour
  const getInitialBookingSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 18) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        date: format(tomorrow, 'yyyy-MM-dd'),
        hour: '09:00',
      };
    }
    const nextHour = String(currentHour + 1).padStart(2, '0');
    return {
      date: format(now, 'yyyy-MM-dd'),
      hour: `${nextHour}:00`,
    };
  };

  const initialSlot = getInitialBookingSlot();
  const [selectedDate, setSelectedDate] = useState(initialSlot.date);
  const [selectedHour, setSelectedHour] = useState(initialSlot.hour);
  const [durationHours, setDurationHours] = useState(4);
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'deposit_50'>('full');
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [specialRequests, setSpecialRequests] = useState('');

  // Booked slots on this day
  const [bookedSlots, setBookedSlots] = useState<Array<{ startTime: string; endTime: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSlotAvailable, setIsSlotAvailable] = useState<boolean | null>(null);
  const [slotUnavailabilityReason, setSlotUnavailabilityReason] = useState<'past' | 'booked' | null>(null);

  // Refund Policy Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [hasAgreedRefundPolicy, setHasAgreedRefundPolicy] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      if (!workspaceId) return;
      try {
        const data = await workspaceApi.getWorkspaceDetails(workspaceId);
        setWorkspace(data);
      } catch (err) {
        console.error('Failed to load workspace:', err);
      }
    }
    loadWorkspace();
  }, [workspaceId]);

  // Query booked slots on selected date for real-time conflict avoidance
  useEffect(() => {
    async function fetchBookedSlots() {
      if (!workspaceId || !selectedDate) return;
      try {
        const slots = await workspaceApi.getBookedSlots(workspaceId, selectedDate);
        if (Array.isArray(slots)) {
          setBookedSlots(slots.filter(Boolean));
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
        setBookedSlots([]);
      }
    }
    fetchBookedSlots();
  }, [workspaceId, selectedDate]);

  // Compute disabled time slots for TimePickerDropdown
  const disabledHours = useMemo(() => {
    if (!Array.isArray(bookedSlots) || bookedSlots.length === 0 || !selectedDate) return [];

    const disabled: string[] = [];
    // Check half-hour increments from 06:00 to 22:30
    for (let h = 6; h <= 22; h++) {
      for (const m of [0, 30]) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const slotDate = parseBookingDateTime(selectedDate, timeStr);
        if (!slotDate) continue;

        const slotTimeMs = slotDate.getTime();
        const isCollision = bookedSlots.some((slot) => {
          if (!slot) return false;
          const sTime = slot.startTime || (slot as any).start_time;
          const eTime = slot.endTime || (slot as any).end_time;
          if (!sTime || !eTime) return false;
          const bStart = new Date(sTime).getTime();
          const bEnd = new Date(eTime).getTime();
          if (isNaN(bStart) || isNaN(bEnd)) return false;
          return slotTimeMs >= bStart && slotTimeMs < bEnd;
        });

        if (isCollision) {
          disabled.push(timeStr);
        }
      }
    }
    return disabled;
  }, [bookedSlots, selectedDate]);

  // Compute availability for each duration button [1, 2, 4, 8]
  const durationAvailability = useMemo(() => {
    const result: Record<number, boolean> = { 1: true, 2: true, 4: true, 8: true };
    const start = parseBookingDateTime(selectedDate, selectedHour);
    if (!start || !Array.isArray(bookedSlots)) return result;

    const startMs = start.getTime();
    [1, 2, 4, 8].forEach((h) => {
      const endMs = startMs + h * 3600000;
      const hasConflict = bookedSlots.some((slot) => {
        if (!slot) return false;
        const sTime = slot.startTime || (slot as any).start_time;
        const eTime = slot.endTime || (slot as any).end_time;
        if (!sTime || !eTime) return false;
        const bStart = new Date(sTime).getTime();
        const bEnd = new Date(eTime).getTime();
        if (isNaN(bStart) || isNaN(bEnd)) return false;
        // Overlap: bStart < endMs && bEnd > startMs
        return bStart < endMs && bEnd > startMs;
      });
      result[h] = !hasConflict;
    });

    return result;
  }, [selectedDate, selectedHour, bookedSlots]);

  // Real-time availability check when date, hour or duration changes
  useEffect(() => {
    async function verifySlotAvailability() {
      if (!workspace || !selectedDate || !selectedHour) {
        setIsSlotAvailable(null);
        setSlotUnavailabilityReason(null);
        return;
      }

      const start = parseBookingDateTime(selectedDate, selectedHour);
      if (!start) {
        setIsSlotAvailable(null);
        setSlotUnavailabilityReason(null);
        return;
      }

      const end = addHours(start, durationHours);

      // Past date / time check
      if (start.getTime() < Date.now() - 5 * 60 * 1000) {
        setIsSlotAvailable(false);
        setSlotUnavailabilityReason('past');
        return;
      }

      try {
        const res = await workspaceApi.checkAvailability(workspace.id, start.toISOString(), end.toISOString());
        if (res && typeof res.isAvailable === 'boolean') {
          setIsSlotAvailable(res.isAvailable);
          setSlotUnavailabilityReason(res.isAvailable ? null : 'booked');
        } else {
          setIsSlotAvailable(null);
          setSlotUnavailabilityReason(null);
        }
      } catch {
        setIsSlotAvailable(null);
        setSlotUnavailabilityReason(null);
      }
    }
    verifySlotAvailability();
  }, [workspace, selectedDate, selectedHour, durationHours]);

  if (!client) {
    return (
      <div className="max-w-md mx-auto my-24 text-center p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Sign In Required</h2>
        <p className="text-sm text-muted-foreground">
          Please sign in or create an account to reserve workspace inventory.
        </p>
        <Link to="/login">
          <Button variant="primary" size="lg" className="w-full mt-4">
            Sign In to Continue
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate pricing
  const hourlyRate = workspace ? parseFloat(String(workspace.hourly_rate)) : 0;
  const workspaceSubtotal = Math.round(hourlyRate * durationHours * 100) / 100;

  // Addons total
  let addOnsTotal = 0;
  const addOnsPayload: Array<{ addOnId: string; quantity: number }> = [];
  if (workspace?.availableAddOns) {
    workspace.availableAddOns.forEach((addon) => {
      const qty = selectedAddOns[addon.id] || 0;
      if (qty > 0) {
        addOnsTotal += addon.price * qty;
        addOnsPayload.push({ addOnId: addon.id, quantity: qty });
      }
    });
  }

  const grandTotal = workspaceSubtotal + addOnsTotal;
  const amountDueToday = paymentPlan === 'deposit_50' ? Math.round(grandTotal * 0.5 * 100) / 100 : grandTotal;
  const remainingBalance = paymentPlan === 'deposit_50' ? Math.round(grandTotal * 0.5 * 100) / 100 : 0.00;

  const toggleAddon = (id: string) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [id]: prev[id] ? 0 : 1,
    }));
  };

  // Open refund policy confirmation dialog before proceeding
  const handleInitiateBooking = () => {
    if (isSlotAvailable === false) return;
    setErrorMessage(null);
    setHasAgreedRefundPolicy(false);
    setIsRefundModalOpen(true);
  };

  // Final confirmed booking submission with atomic 10-minute hold
  const handleConfirmReservation = async () => {
    if (!workspace || !hasAgreedRefundPolicy) return;
    setIsLoading(true);
    setErrorMessage(null);

    const start = parseBookingDateTime(selectedDate, selectedHour);
    if (!start) {
      setErrorMessage('Please select a valid reservation date and starting time.');
      setIsLoading(false);
      setIsRefundModalOpen(false);
      return;
    }

    const end = addHours(start, durationHours);

    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      setErrorMessage('The selected reservation start time cannot be in the past. Please choose an upcoming time slot.');
      setIsLoading(false);
      setIsRefundModalOpen(false);
      return;
    }

    try {
      const booking = await bookingApi.createBooking({
        workspaceId: workspace.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        addOns: addOnsPayload,
        specialRequests,
        paymentPlan,
      });

      if (booking && booking.id) {
        setIsRefundModalOpen(false);
        navigate(`/payment/${booking.id}`);
      } else {
        throw new Error('Reservation could not be initialized.');
      }
    } catch (err: any) {
      setIsRefundModalOpen(false);
      if (err.data?.errors) {
        const details = Object.values(err.data.errors).join(' ');
        setErrorMessage(details || err.message);
      } else {
        setErrorMessage(err.message || 'Failed to complete reservation. Time slot may be already reserved.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      <Link
        to={workspace ? `/workspaces/${workspace.id}` : '/workspaces'}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to details
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Reserve {workspace?.name || 'Workspace'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick your reservation date, starting time, duration, payment plan, and optional amenities.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-6 animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Date/Time, Payment Plan, Add-ons */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Date & Time Selection */}
          <Card className="relative z-30 overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> 1. Select Reservation Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 overflow-visible">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Dropdown */}
                <div className="relative">
                  <DatePickerDropdown
                    label="Select a day"
                    value={selectedDate}
                    onChange={(newDate) => {
                      setSelectedDate(newDate);
                      setErrorMessage(null);
                    }}
                  />
                </div>

                {/* Starting Time Dropdown with Disabled Booked Slots */}
                <div className="relative">
                  <TimePickerDropdown
                    label="Start with"
                    value={selectedHour}
                    disabledSlots={disabledHours}
                    onChange={(newHour) => {
                      setSelectedHour(newHour);
                      setErrorMessage(null);
                    }}
                  />
                </div>
              </div>

              {/* Real-time slot availability badge */}
              {isSlotAvailable !== null && (
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSlotAvailable
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}
                >
                  {isSlotAvailable ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Workspace slot is currently available (10-min hold will apply)</span>
                    </>
                  ) : slotUnavailabilityReason === 'past' ? (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Selected time is in the past</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Time slot is already reserved or held by another member</span>
                    </>
                  )}
                </div>
              )}

              {/* Duration Buttons with Real-Time Conflict Disabling */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Duration: <span className="text-primary font-bold">{durationHours} Hours</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 4, 8].map((h) => {
                    const isAvailable = durationAvailability[h];
                    return (
                      <Button
                        key={h}
                        type="button"
                        variant={durationHours === h ? 'primary' : 'outline'}
                        size="sm"
                        disabled={!isAvailable}
                        onClick={() => setDurationHours(h)}
                        className={`font-semibold ${!isAvailable ? 'opacity-40 line-through cursor-not-allowed' : ''}`}
                      >
                        {h} {h === 1 ? 'Hour' : h === 8 ? 'Full Day (8h)' : 'Hours'}
                        {!isAvailable && ' (Conflict)'}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Flexible Payment Options (Full vs 50% Deposit) */}
          <Card className="relative z-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> 2. Flexible Payment Option
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option 1: Pay 100% Full */}
                <div
                  onClick={() => setPaymentPlan('full')}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2',
                    paymentPlan === 'full'
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                      : 'border-border/80 bg-card hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" /> Pay Full (100%)
                    </span>
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border flex items-center justify-center',
                        paymentPlan === 'full' ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}
                    >
                      {paymentPlan === 'full' && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Settle 100% now. No remaining balance due at check-in.
                  </p>
                  <div className="text-xs font-bold text-foreground pt-1">
                    Due Today: <span className="text-primary font-black">₱{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Option 2: Pay 50% Deposit */}
                <div
                  onClick={() => setPaymentPlan('deposit_50')}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2',
                    paymentPlan === 'deposit_50'
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/40'
                      : 'border-border/80 bg-card hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                      <Percent className="h-4 w-4 text-amber-500" /> Pay 50% Deposit
                    </span>
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border flex items-center justify-center',
                        paymentPlan === 'deposit_50' ? 'border-amber-500 bg-amber-500' : 'border-muted-foreground'
                      )}
                    >
                      {paymentPlan === 'deposit_50' && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Reserve slot today with 50% down. Pay remaining 50% on check-in.
                  </p>
                  <div className="text-xs font-bold text-foreground pt-1 flex justify-between">
                    <span>
                      Due Today: <span className="text-amber-600 dark:text-amber-400 font-black">₱{(grandTotal * 0.5).toLocaleString()}</span>
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      Bal: ₱{(grandTotal * 0.5).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Add-ons selector */}
          <Card className="relative z-10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">3. Optional Add-ons & Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace?.availableAddOns?.map((addon) => {
                const isSelected = (selectedAddOns[addon.id] || 0) > 0;
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border/80 bg-background/50 hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-5 w-5 rounded-md border flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40 bg-transparent'
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{addon.name}</div>
                        <div className="text-xs text-muted-foreground">{addon.description}</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">+₱{addon.price}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 4. Special Requests */}
          <Card className="relative z-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">4. Special Instructions (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. Need HDMI cable adapter, extra chair, quiet corner..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Summary Card */}
        <div className="relative z-0">
          <Card className="sticky top-24 shadow-xl border-border/80">
            <CardHeader className="border-b border-border/80 pb-4">
              <CardTitle className="text-base font-bold">Reservation Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Workspace:</span>
                <span className="text-foreground font-semibold">{workspace?.name}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Date:</span>
                <span className="text-foreground font-medium">
                  {selectedDate ? format(parseISO(selectedDate), 'dd.MM.yyyy') : selectedDate}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Time Slot:</span>
                <span className="text-foreground font-medium">
                  {selectedHour} ({durationHours} hrs)
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Payment Plan:</span>
                <span className="text-foreground font-bold">
                  {paymentPlan === 'deposit_50' ? '50% Deposit' : 'Full Payment'}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Desk rate (₱{hourlyRate} × {durationHours}h):</span>
                  <span className="text-foreground">₱{workspaceSubtotal.toLocaleString()}</span>
                </div>
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Selected Add-ons:</span>
                    <span className="text-foreground">₱{addOnsTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground pt-1">
                  <span>Total Workspace Value:</span>
                  <span className="text-foreground font-bold">₱{grandTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-border/80 text-base font-black">
                  <span className="text-foreground">Due Today:</span>
                  <span className="text-primary text-xl">₱{amountDueToday.toLocaleString()}</span>
                </div>

                {paymentPlan === 'deposit_50' && (
                  <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold pt-1">
                    <span>Balance at Check-in:</span>
                    <span>₱{remainingBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* 30% Refund Policy Banner */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>30% Refund Cancellation Policy</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  Reserving locks this space for you. If you cancel, only 30% of the paid amount is refundable.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4 font-bold shadow-lg shadow-primary/20"
                disabled={isSlotAvailable === false}
                onClick={handleInitiateBooking}
              >
                {isSlotAvailable === false ? 'Time Slot Unavailable' : 'Proceed to Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancellation & 30% Refund Policy Heads-up Pop-up Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Important Cancellation Policy</h3>
                  <p className="text-xs text-muted-foreground">Please read before confirming your reservation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs text-foreground">
              <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Non-Full Refund Warning: 30% Refund Only</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By reserving <strong className="text-foreground">{workspace?.name}</strong>, a temporary <strong>10-minute hold</strong> will be placed on your selected time slot to prevent any other client from booking it.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Please be advised that reservations are <strong>non-refundable in full</strong>. In the event of cancellation, you will receive only a <strong className="text-amber-600 dark:text-amber-400 font-black">30% refund</strong> of the amount paid today. The remaining 70% is retained as a reservation slot fee.
              </p>
            </div>

            {/* Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAgreedRefundPolicy}
                onChange={(e) => setHasAgreedRefundPolicy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-foreground leading-snug">
                I understand and agree that cancelling this reservation entitles me to only a <strong>30% refund</strong> of the paid amount.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-semibold"
                onClick={() => setIsRefundModalOpen(false)}
              >
                Go Back
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 font-bold shadow-lg shadow-primary/25"
                disabled={!hasAgreedRefundPolicy || isLoading}
                isLoading={isLoading}
                onClick={handleConfirmReservation}
              >
                <Lock className="h-4 w-4 mr-1.5" />
                Agree & Reserve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
