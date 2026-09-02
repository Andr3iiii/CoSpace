# Walkthrough — Rich Booking Receipt Email with QR, 30% Refund Policy Dialog, 50% Deposit & 10-Minute Hold Engine

We have implemented and verified all four critical booking and payment enhancements requested for CoSpace:

1. **Rich Booking Confirmation & Receipt Email with QR Pass**: Dispatches a high-end email to the client's Gmail containing a personalized welcome (`Welcome, Andrei Cruz!`), check-in QR Code, itemized pricing, and cancellation policy notice.
2. **Cancellation & 30% Refund Policy Heads-Up Pop-up Modal**: Requires explicit acknowledgment before proceeding to payment, explaining that cancellations are eligible for only a **30% refund**.
3. **Flexible Payment Option (100% Full vs 50% Deposit)**: Clients can reserve by paying in full or paying a 50% down-deposit with the remaining 50% due at check-in.
4. **Real-time Booked Slots & 10-Minute Temporary Hold**: Unavailable hours and conflicting durations are disabled in real time. Creating a booking locks the slot under a 10-minute hold with row-level locks preventing simultaneous double-booking.

---

## 1. Database Architecture (`Database/`)

### Migration `005_booking_holds_and_payment_options.sql`
- Added columns to `bookings`:
  - `hold_expires_at TIMESTAMPTZ`: Automatically tracks the 10-minute temporary reservation window.
  - `payment_plan VARCHAR(20) NOT NULL DEFAULT 'full' CHECK (payment_plan IN ('full', 'deposit_50'))`.
  - `paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00`.
  - `remaining_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00`.
- Updated `fn_check_workspace_availability`:
  - Checks if there is any overlap against:
    `(status IN ('confirmed', 'active') OR (status = 'pending' AND (hold_expires_at IS NULL OR hold_expires_at > CURRENT_TIMESTAMP)))`
- Updated `fn_create_booking_atomic`:
  - Expires any stale pending holds whose `hold_expires_at <= CURRENT_TIMESTAMP`.
  - Locks the workspace and conflicting bookings using `FOR UPDATE`.
  - Rejects overlapping reservations with PostgreSQL error code `23P01` (`BOOKING_CONFLICT`).
  - Sets `hold_expires_at = CURRENT_TIMESTAMP + INTERVAL '10 minutes'`.
  - Computes initial `remaining_balance` (e.g. 50% of final amount for deposit plan).

---

## 2. Backend Services & API (`Client/Backend/`)

### Rich Receipt Email Dispatch (`resend/index.ts`)
- Implemented `sendBookingReceipt(toEmail, clientName, receiptData)`:
  - Personalized client greeting: `Welcome, ${clientName}!`.
  - Luxury branded dark email layout with gradient header and confirmed badges.
  - Workspace details (Flagship address, floor, room, date and time interval).
  - High-res digital QR check-in pass: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${checkInCode}` + alphanumeric passcode.
  - Itemized receipt table with breakdown of Amount Paid Today and Remaining Balance Due at Check-in.
  - Amber policy callout: `⚠️ Important Cancellation & Refund Policy Notice (30% Refund Only)`.
- Verified live delivery to `rcarullo741@gmail.com` via Resend API (HTTP 200 OK).

### Payment Service & IDOR Security (`clientPayment.service.ts` & `clientPayment.repository.ts`)
- In `createPaymentIntent`:
  - Computes charged amount based on `payment_plan` (`50%` vs `100%`).
  - Validates that the 10-minute hold has not expired before generating payment intent.
- In `confirmPayment`:
  - Enforces client ownership check (`payment.client_id === req.clientUser.id`) to prevent IDOR attacks.
  - Transitions booking to `confirmed`, clears `hold_expires_at`, and updates `paid_amount` and `remaining_balance`.
  - Asynchronously dispatches `resendClient.sendBookingReceipt(...)`.

### Real-Time Booked Slots API (`workspace.routes.ts`)
- Added endpoint: `GET /api/client/workspaces/:id/booked-slots?date=YYYY-MM-DD`
  - Returns all intervals on that day with active or held bookings.

---

## 3. Frontend Booking Experience (`Client/Frontend/`)

### Real-Time Time & Duration Conflict Disabling
- `TimePickerDropdown.tsx` accepts `disabledSlots`. Any time slot overlapping with an existing reservation is grayed out, crossed out (`line-through`), non-clickable, and tagged with a bold red `Reserved` badge.
- `BookingPage.tsx` dynamically disables duration buttons (`[1, 2, 4, 8]` hours) if the reservation window would overlap with an upcoming booking.

### Flexible Payment Option Selector
- Added interactive radio cards:
  - **Pay Full (100%)**: Pay 100% now, balance due at check-in: ₱0.00.
  - **Pay 50% Deposit First**: Pay 50% now as down payment, balance due at check-in: ₱X.
- Live price summary dynamically updates "Amount Due Today" and "Balance Due at Check-in".

### Cancellation & 30% Refund Policy Pop-up Modal
- Triggered when the user clicks **"Proceed to Payment"**.
- Displays an alert banner:
  > *"Please note before reserving: Workspace reservations are non-refundable in full. In accordance with CoSpace reservation policy, if you cancel this reservation, you will only receive a **30% refund** of the amount paid today. 70% is retained as a reservation slot fee."*
- User must check: *"I understand and agree that cancelling this reservation entitles me to only a 30% refund of the paid amount."*
- Clicking **"Agree & Reserve"** executes the booking mutation, creating the atomic 10-minute hold in PostgreSQL.

### Payment Page Live 10-Minute Hold Countdown (`PaymentPage.tsx`)
- Displays live countdown timer: `⏳ Temporary hold active: 09:45 remaining`.
- If the hold expires before checkout completes, disables checkout with an explicit prompt.
- Renders payment plan breakdown (Deposit vs Full) and refund policy reminder.

---

## 4. Verification Results

### Live End-to-End Test Suite (`scratch/test_booking_flow_e2e.js`)
```text
✓ Test 1: Atomic Booking with 10-Minute Hold & 50% Deposit -> PASSED
✓ Test 2: Concurrency & Double-Booking Protection -> PASSED (Conflict 23P01 thrown)
✓ Test 3: Availability Check Rejection During Hold -> PASSED (fn_check_workspace_availability is false)
✓ Test 4: Booked Slots Query Integration -> PASSED (found 1 held slot for date)
✓ Test 5: Payment Intent & 50% Deposit Confirmation -> PASSED (status: confirmed, hold cleared to null, paid: ₱400, bal: ₱400)
🎉 ALL 5 BOOKING FLOW & CONCURRENCY TESTS PASSED WITH FLYING COLORS!
```

### Vitest Unit & Invariant Test Suite
- `Client/Backend`: **33/33 tests passed** (10-minute hold logic, deposit calculation, 30% refund formula, overlap logic, registration security).

### Production Builds
- `Client/Backend`: `tsc` clean build (0 errors).
- `Client/Frontend`: `tsc && vite build` clean build (0 errors).
