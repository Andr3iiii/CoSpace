import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { bookingApi } from '../../api/booking.api';
import { useAuth } from '../../stores/AuthContext';
import { Workspace } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { addHours, format } from 'date-fns';
import { cn } from '@/lib/utils';

export const BookingPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { client } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);

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
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const toggleAddon = (id: string) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [id]: prev[id] ? 0 : 1,
    }));
  };

  const handleBookingSubmit = async () => {
    if (!workspace) return;
    setIsLoading(true);
    setErrorMessage(null);

    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hourStr, minStr] = selectedHour.split(':');
    const start = new Date(year, month - 1, day, parseInt(hourStr, 10), parseInt(minStr, 10), 0);
    const end = addHours(start, durationHours);

    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      setErrorMessage('The selected reservation start time cannot be in the past. Please choose an upcoming time slot.');
      setIsLoading(false);
      return;
    }

    try {
      const booking = await bookingApi.createBooking({
        workspaceId: workspace.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        addOns: addOnsPayload,
        specialRequests,
      });

      // Redirect to payment step
      navigate(`/payment/${booking.id}`);
    } catch (err: any) {
      if (err.data?.errors) {
        const details = Object.values(err.data.errors).join(' ');
        setErrorMessage(details || err.message);
      } else {
        setErrorMessage(err.message || 'Failed to complete reservation. Time slot may be unavailable.');
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
          Select your desired date, duration, and optional add-ons.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-6 animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Date, Time & Add-ons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date & Time selector */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">1. Date & Time Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Reservation Date"
                  type="date"
                  value={selectedDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <Input
                  label="Start Time"
                  type="time"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Duration: <span className="text-primary font-bold">{durationHours} Hours</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 4, 8].map((h) => (
                    <Button
                      key={h}
                      type="button"
                      variant={durationHours === h ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setDurationHours(h)}
                      className="font-semibold"
                    >
                      {h} {h === 1 ? 'Hour' : h === 8 ? 'Full Day (8 hrs)' : 'Hours'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add-ons selector */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">2. Optional Add-ons & Equipment</CardTitle>
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

          {/* Special Requests */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">3. Special Instructions (Optional)</CardTitle>
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
        <div>
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
                <span className="text-foreground font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Time Slot:</span>
                <span className="text-foreground font-medium">
                  {selectedHour} ({durationHours} hrs)
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
                <div className="flex justify-between items-baseline pt-3 border-t border-border/80 text-base font-black">
                  <span className="text-foreground">Total Amount:</span>
                  <span className="text-primary text-xl">₱{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4 font-bold shadow-lg shadow-primary/20"
                isLoading={isLoading}
                onClick={handleBookingSubmit}
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
