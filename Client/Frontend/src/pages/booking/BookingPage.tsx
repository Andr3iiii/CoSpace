import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { bookingApi } from '../../api/booking.api';
import { useAuth } from '../../stores/AuthContext';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { theme } from '../../theme/theme';
import { ArrowLeft, Calendar, Clock, Plus, Check, AlertCircle } from 'lucide-react';
import { addHours, format, setHours, setMinutes } from 'date-fns';

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
      <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Sign In Required
        </h2>
        <p style={{ color: theme.colors.textMuted, marginBottom: '24px', fontSize: '14px' }}>
          Please sign in or create an account to reserve workspace inventory.
        </p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="lg">Sign In to Continue</Button>
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

  const toggleAddon = (id: string, price: number) => {
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <Link
        to={workspace ? `/workspaces/${workspace.id}` : '/workspaces'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.colors.textMuted,
          textDecoration: 'none',
          fontSize: '13px',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Back to details
      </Link>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Reserve {workspace?.name || 'Workspace'}
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.textMuted }}>
          Select your desired date, duration, and optional add-ons.
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px',
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.dangerBg,
            border: `1px solid ${theme.colors.dangerBorder}`,
            color: theme.colors.danger,
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Form: Date, Time & Add-ons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Date & Time selector */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              1. Date & Time Duration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: theme.colors.textMuted, marginBottom: '8px', fontWeight: 500 }}>
                Duration: <strong style={{ color: theme.colors.primary }}>{durationHours} Hours</strong>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 4, 8].map((h) => (
                  <Button
                    key={h}
                    type="button"
                    variant={durationHours === h ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setDurationHours(h)}
                  >
                    {h} {h === 1 ? 'Hour' : h === 8 ? 'Full Day (8 hrs)' : 'Hours'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Add-ons selector */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              2. Optional Add-ons & Equipment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workspace?.availableAddOns?.map((addon) => {
                const isSelected = (selectedAddOns[addon.id] || 0) > 0;
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id, addon.price)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      borderRadius: theme.radius.md,
                      backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
                      border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.textDim}`,
                          backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{addon.name}</div>
                        <div style={{ fontSize: '12px', color: theme.colors.textDim }}>{addon.description}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.text }}>
                      +₱{addon.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Special Requests */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              3. Special Instructions (Optional)
            </h3>
            <Input
              placeholder="e.g. Need HDMI cable adapter, extra chair, quiet corner..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </Card>
        </div>

        {/* Right Summary Card */}
        <div>
          <Card style={{ position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
              Reservation Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Workspace:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{workspace?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Date:</span>
                <span style={{ color: '#fff' }}>{selectedDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Time Slot:</span>
                <span style={{ color: '#fff' }}>{selectedHour} ({durationHours} hrs)</span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: theme.colors.textMuted }}>Desk rate (₱{hourlyRate} × {durationHours}h):</span>
                <span>₱{workspaceSubtotal.toLocaleString()}</span>
              </div>
              {addOnsTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: theme.colors.textMuted }}>Selected Add-ons:</span>
                  <span>₱{addOnsTotal.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${theme.colors.border}`, fontSize: '18px', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: theme.colors.primary }}>₱{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              isLoading={isLoading}
              onClick={handleBookingSubmit}
            >
              Proceed to Payment
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
