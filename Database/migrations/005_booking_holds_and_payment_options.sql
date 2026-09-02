-- ============================================================================
-- Migration 005: Booking Holds, Flexible Payment Options & Concurrency Updates
-- ============================================================================

-- 1. Add hold expiration and flexible payment columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_plan VARCHAR(20) NOT NULL DEFAULT 'full' CHECK (payment_plan IN ('full', 'deposit_50')),
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (remaining_balance >= 0);

-- 2. Index for fast active slot and hold lookup
CREATE INDEX IF NOT EXISTS idx_bookings_active_holds 
ON bookings (workspace_id, status, hold_expires_at);

-- 3. Update fn_check_workspace_availability to consider 10-minute holds
CREATE OR REPLACE FUNCTION fn_check_workspace_availability(
    p_workspace_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_ws_status VARCHAR;
    v_conflict_count INT;
BEGIN
    -- Validate time bounds
    IF p_end_time <= p_start_time THEN
        RETURN FALSE;
    END IF;

    -- Validate workspace existence and availability status
    SELECT status INTO v_ws_status
    FROM public.workspaces
    WHERE id = p_workspace_id;

    IF v_ws_status IS NULL OR v_ws_status != 'available' THEN
        RETURN FALSE;
    END IF;

    -- Overlap condition: active bookings or unexpired pending holds
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE workspace_id = p_workspace_id
      AND (
        status IN ('confirmed', 'active')
        OR (status = 'pending' AND (hold_expires_at IS NULL OR hold_expires_at > CURRENT_TIMESTAMP))
      )
      AND (start_time < p_end_time AND end_time > p_start_time);

    RETURN (v_conflict_count = 0);
END;
$$;

-- 4. Update fn_create_booking_atomic to enforce atomic 10-minute hold and payment plan
CREATE OR REPLACE FUNCTION fn_create_booking_atomic(
    p_client_id UUID,
    p_workspace_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_booking_reference VARCHAR(30),
    p_check_in_code VARCHAR(50),
    p_special_requests TEXT,
    p_hours NUMERIC,
    p_hourly_rate NUMERIC,
    p_workspace_subtotal NUMERIC,
    p_total_amount NUMERIC,
    p_final_amount NUMERIC,
    p_add_ons JSONB DEFAULT '[]'::jsonb,
    p_payment_plan VARCHAR(20) DEFAULT 'full'
)
RETURNS TABLE (
    id UUID,
    booking_reference VARCHAR,
    client_id UUID,
    workspace_id UUID,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_amount NUMERIC,
    discount_amount NUMERIC,
    final_amount NUMERIC,
    status VARCHAR,
    check_in_code VARCHAR,
    special_requests TEXT,
    hold_expires_at TIMESTAMPTZ,
    payment_plan VARCHAR,
    paid_amount NUMERIC,
    remaining_balance NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
VOLATILE
AS $$
#variable_conflict use_column
DECLARE
    v_ws_record RECORD;
    v_conflict_id UUID;
    v_booking_id UUID;
    v_addon RECORD;
    v_authoritative_price NUMERIC;
    v_final_unit_price NUMERIC;
    v_final_subtotal NUMERIC;
    v_rem_balance NUMERIC;
    v_hold_expiry TIMESTAMPTZ;
BEGIN
    -- 1. Validate time bounds
    IF p_end_time <= p_start_time THEN
        RAISE EXCEPTION 'End time must be after start time' USING ERRCODE = '22023';
    END IF;

    -- 2. Clean up any previous unconfirmed pending holds by THIS client on this workspace
    -- (Allows members to click back and adjust their booking without being blocked by their own hold)
    UPDATE public.bookings AS bkg
    SET status = 'cancelled',
        cancelled_reason = 'Superseded by member re-booking',
        cancelled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE bkg.workspace_id = p_workspace_id
      AND bkg.client_id = p_client_id
      AND bkg.status = 'pending';

    -- Clean up any expired pending holds on this workspace
    UPDATE public.bookings AS bkg
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE bkg.workspace_id = p_workspace_id
      AND bkg.status = 'pending'
      AND bkg.hold_expires_at <= CURRENT_TIMESTAMP;

    -- 3. Lock workspace row for update to serialize concurrent reservations
    SELECT ws.id, ws.name, ws.status INTO v_ws_record
    FROM public.workspaces ws
    WHERE ws.id = p_workspace_id
    FOR UPDATE;

    IF v_ws_record.id IS NULL THEN
        RAISE EXCEPTION 'Workspace not found' USING ERRCODE = '22023';
    END IF;

    IF v_ws_record.status != 'available' THEN
        RAISE EXCEPTION 'Workspace is currently unavailable for booking' USING ERRCODE = '22023';
    END IF;

    -- 4. Check for any overlapping bookings with row-level locks
    SELECT b.id INTO v_conflict_id
    FROM public.bookings b
    WHERE b.workspace_id = p_workspace_id
      AND (
        b.status IN ('confirmed', 'active')
        OR (b.status = 'pending' AND (b.hold_expires_at IS NULL OR b.hold_expires_at > CURRENT_TIMESTAMP))
      )
      AND (b.start_time < p_end_time AND b.end_time > p_start_time)
    LIMIT 1
    FOR UPDATE;

    IF v_conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'The selected time slot was just booked by another member.' USING ERRCODE = '23P01';
    END IF;

    -- Compute remaining balance and 10-minute hold expiration
    v_hold_expiry := CURRENT_TIMESTAMP + INTERVAL '10 minutes';
    IF p_payment_plan = 'deposit_50' THEN
        v_rem_balance := ROUND(p_final_amount * 0.50, 2);
    ELSE
        v_rem_balance := 0.00;
    END IF;

    -- 5. Insert main booking record with temporary 10-minute hold
    INSERT INTO public.bookings (
        booking_reference,
        client_id,
        workspace_id,
        start_time,
        end_time,
        total_amount,
        discount_amount,
        final_amount,
        status,
        check_in_code,
        special_requests,
        hold_expires_at,
        payment_plan,
        paid_amount,
        remaining_balance
    )
    VALUES (
        p_booking_reference,
        p_client_id,
        p_workspace_id,
        p_start_time,
        p_end_time,
        p_total_amount,
        0.00,
        p_final_amount,
        'pending',
        p_check_in_code,
        p_special_requests,
        v_hold_expiry,
        COALESCE(p_payment_plan, 'full'),
        0.00,
        v_rem_balance
    )
    RETURNING bookings.id INTO v_booking_id;

    -- 6. Insert primary workspace line item
    INSERT INTO public.booking_items (
        booking_id,
        description,
        unit_price,
        quantity,
        subtotal
    )
    VALUES (
        v_booking_id,
        'Workspace Reservation (' || p_hours || ' hrs @ ₱' || p_hourly_rate || '/hr)',
        p_hourly_rate,
        p_hours::INT,
        p_workspace_subtotal
    );

    -- 7. Insert add-on line items from JSON array
    IF p_add_ons IS NOT NULL AND jsonb_array_length(p_add_ons) > 0 THEN
        FOR v_addon IN SELECT * FROM jsonb_to_recordset(p_add_ons) AS x(
            id UUID,
            add_on_id UUID,
            name VARCHAR,
            unit_price NUMERIC,
            quantity INT,
            subtotal NUMERIC
        )
        LOOP
            SELECT a.price INTO v_authoritative_price
            FROM public.add_ons a
            WHERE a.id = COALESCE(v_addon.add_on_id, v_addon.id) AND a.is_active = TRUE;

            IF v_authoritative_price IS NOT NULL THEN
                v_final_unit_price := v_authoritative_price;
                v_final_subtotal := v_final_unit_price * COALESCE(v_addon.quantity, 1);

                INSERT INTO public.booking_add_ons (
                    booking_id,
                    add_on_id,
                    quantity,
                    unit_price,
                    subtotal
                )
                VALUES (
                    v_booking_id,
                    COALESCE(v_addon.add_on_id, v_addon.id),
                    COALESCE(v_addon.quantity, 1),
                    v_final_unit_price,
                    v_final_subtotal
                );

                INSERT INTO public.booking_items (
                    booking_id,
                    description,
                    unit_price,
                    quantity,
                    subtotal
                )
                VALUES (
                    v_booking_id,
                    'Add-on: ' || COALESCE(v_addon.name, 'Optional Service'),
                    v_final_unit_price,
                    COALESCE(v_addon.quantity, 1),
                    v_final_subtotal
                );
            END IF;
        END LOOP;
    END IF;

    -- 8. Audit status transition history
    INSERT INTO public.booking_status_history (
        booking_id,
        from_status,
        to_status,
        changed_by_type,
        reason
    )
    VALUES (
        v_booking_id,
        NULL,
        'pending',
        'client',
        '10-minute temporary reservation hold created'
    );

    -- 9. Return completed booking record
    RETURN QUERY
    SELECT 
        b.id,
        b.booking_reference,
        b.client_id,
        b.workspace_id,
        b.start_time,
        b.end_time,
        b.total_amount,
        b.discount_amount,
        b.final_amount,
        b.status,
        b.check_in_code,
        b.special_requests,
        b.hold_expires_at,
        b.payment_plan,
        b.paid_amount,
        b.remaining_balance,
        b.created_at,
        b.updated_at
    FROM public.bookings b
    WHERE b.id = v_booking_id;
END;
$$;
