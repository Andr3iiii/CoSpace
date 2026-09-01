-- ============================================================================
-- Migration 003: High-Impact PostgreSQL Stored Functions & Procedures
-- Provides database-authoritative concurrency safety, atomic operations,
-- and high-efficiency administrative reporting.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Partial Index for Fast Overlap Detection
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_active_slots 
ON bookings (workspace_id, start_time, end_time) 
WHERE status IN ('pending', 'confirmed', 'active');

-- ----------------------------------------------------------------------------
-- 2. Function: fn_check_workspace_availability
-- Checks whether a workspace is available for a requested time interval.
-- Returns TRUE if available, FALSE if booked/unavailable.
-- ----------------------------------------------------------------------------
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

    -- Overlap condition: (existing.start_time < requested.end_time AND existing.end_time > requested.start_time)
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE workspace_id = p_workspace_id
      AND status IN ('pending', 'confirmed', 'active')
      AND (start_time < p_end_time AND end_time > p_start_time);

    RETURN (v_conflict_count = 0);
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Function: fn_create_booking_atomic
-- Performs concurrency-safe booking creation in an atomic operation.
-- Locks workspace row (FOR UPDATE), checks collision, inserts booking, line items,
-- itemized add-ons, and audit status history.
-- ----------------------------------------------------------------------------
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
    p_add_ons JSONB DEFAULT '[]'::jsonb
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    v_ws_record RECORD;
    v_conflict_id UUID;
    v_booking_id UUID;
    v_addon RECORD;
BEGIN
    -- 1. Validate time bounds
    IF p_end_time <= p_start_time THEN
        RAISE EXCEPTION 'End time must be after start time' USING ERRCODE = '22023';
    END IF;

    -- 2. Lock workspace row for update to serialize concurrent reservations
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

    -- 3. Check for any overlapping bookings with row-level locks on existing bookings
    SELECT b.id INTO v_conflict_id
    FROM public.bookings b
    WHERE b.workspace_id = p_workspace_id
      AND b.status IN ('pending', 'confirmed', 'active')
      AND (b.start_time < p_end_time AND b.end_time > p_start_time)
    LIMIT 1
    FOR UPDATE;

    IF v_conflict_id IS NOT NULL THEN
        -- Raise custom conflict error code: 23P01 (BOOKING_CONFLICT)
        RAISE EXCEPTION 'The selected time slot was just booked by another member.' USING ERRCODE = '23P01';
    END IF;

    -- 4. Insert main booking record
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
        special_requests
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
        p_special_requests
    )
    RETURNING bookings.id INTO v_booking_id;

    -- 5. Insert primary booking line item
    INSERT INTO public.booking_items (
        booking_id,
        description,
        unit_price,
        quantity,
        subtotal
    )
    VALUES (
        v_booking_id,
        v_ws_record.name || ' (' || p_hours::text || ' hours)',
        p_hourly_rate,
        p_hours::int,
        p_workspace_subtotal
    );

    -- 6. Insert itemized add-ons if provided
    IF p_add_ons IS NOT NULL AND jsonb_array_length(p_add_ons) > 0 THEN
        FOR v_addon IN SELECT * FROM jsonb_to_recordset(p_add_ons) AS x(
            id UUID,
            name VARCHAR,
            unitPrice NUMERIC,
            quantity INT,
            subtotal NUMERIC
        )
        LOOP
            INSERT INTO public.booking_add_ons (
                booking_id,
                add_on_id,
                quantity,
                unit_price,
                subtotal
            )
            VALUES (
                v_booking_id,
                v_addon.id,
                v_addon.quantity,
                v_addon.unitPrice,
                v_addon.subtotal
            );
        END LOOP;
    END IF;

    -- 7. Record initial status history audit entry
    INSERT INTO public.booking_status_history (
        booking_id,
        from_status,
        to_status,
        changed_by_type,
        changed_by_id,
        reason
    )
    VALUES (
        v_booking_id,
        NULL,
        'pending',
        'client',
        p_client_id,
        'Booking initialized by client.'
    );

    -- 8. Return newly inserted booking details
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
        b.created_at,
        b.updated_at
    FROM public.bookings b
    WHERE b.id = v_booking_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Function: fn_cancel_booking_atomic
-- Atomically transitions booking status to cancelled, recording reason and audit log.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_cancel_booking_atomic(
    p_booking_id UUID,
    p_client_id UUID,
    p_reason TEXT DEFAULT 'Cancelled by member.'
)
RETURNS TABLE (
    id UUID,
    status VARCHAR,
    cancelled_reason TEXT,
    cancelled_at TIMESTAMPTZ
)
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    v_current_status VARCHAR;
BEGIN
    SELECT b.status INTO v_current_status
    FROM public.bookings b
    WHERE b.id = p_booking_id AND b.client_id = p_client_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Booking not found' USING ERRCODE = '22023';
    END IF;

    IF v_current_status IN ('cancelled', 'completed') THEN
        RAISE EXCEPTION 'Cannot cancel a booking that is already %', v_current_status USING ERRCODE = '22023';
    END IF;

    UPDATE public.bookings
    SET status = 'cancelled',
        cancelled_reason = COALESCE(p_reason, 'Cancelled by member.'),
        cancelled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE bookings.id = p_booking_id AND bookings.client_id = p_client_id;

    INSERT INTO public.booking_status_history (
        booking_id,
        from_status,
        to_status,
        changed_by_type,
        changed_by_id,
        reason
    )
    VALUES (
        p_booking_id,
        v_current_status,
        'cancelled',
        'client',
        p_client_id,
        COALESCE(p_reason, 'Cancelled by member.')
    );

    RETURN QUERY
    SELECT 
        b.id,
        b.status,
        b.cancelled_reason,
        b.cancelled_at
    FROM public.bookings b
    WHERE b.id = p_booking_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Function: fn_get_admin_dashboard_kpis
-- Aggregates all KPI metrics in a single database query roundtrip.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_admin_dashboard_kpis()
RETURNS TABLE (
    today_revenue NUMERIC,
    today_bookings INT,
    active_visitors INT,
    available_workspaces INT,
    occupancy_rate INT,
    pending_bookings INT,
    pending_payments INT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_today_revenue NUMERIC;
    v_today_bookings INT;
    v_active_visitors INT;
    v_avail_ws INT;
    v_total_ws INT;
    v_occupancy INT;
    v_pending_bks INT;
    v_pending_pmts INT;
BEGIN
    -- 1. Today's Revenue
    SELECT COALESCE(SUM(amount), 0) INTO v_today_revenue
    FROM public.payments
    WHERE status = 'completed' AND paid_at >= CURRENT_DATE;

    -- 2. Today's Bookings
    SELECT COUNT(b.id)::int INTO v_today_bookings
    FROM public.bookings b
    WHERE b.created_at >= CURRENT_DATE;

    -- 3. Active Visitors
    SELECT COUNT(ci.id)::int INTO v_active_visitors
    FROM public.check_ins ci
    WHERE ci.checked_in_at >= CURRENT_DATE AND ci.checked_out_at IS NULL;

    -- 4. Workspace counts & Occupancy
    SELECT COUNT(ws.id)::int INTO v_avail_ws FROM public.workspaces ws WHERE ws.status = 'available';
    SELECT COUNT(ws.id)::int INTO v_total_ws FROM public.workspaces ws;

    IF v_total_ws > 0 THEN
        v_occupancy := ROUND(((v_total_ws - v_avail_ws)::numeric / v_total_ws::numeric) * 100)::int;
        IF v_occupancy < 0 THEN v_occupancy := 0; END IF;
    ELSE
        v_occupancy := 0;
    END IF;

    -- 5. Pending Bookings
    SELECT COUNT(b.id)::int INTO v_pending_bks FROM public.bookings b WHERE b.status = 'pending';

    -- 6. Pending Payments
    SELECT COUNT(p.id)::int INTO v_pending_pmts FROM public.payments p WHERE p.status = 'pending';

    RETURN QUERY
    SELECT 
        v_today_revenue,
        v_today_bookings,
        v_active_visitors,
        v_avail_ws,
        v_occupancy,
        v_pending_bks,
        v_pending_pmts;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Function: fn_get_admin_daily_breakdown
-- Aggregates date-gap filled revenue & booking statistics for dashboard analytics.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_admin_daily_breakdown(p_days INT DEFAULT 14)
RETURNS TABLE (
    date TEXT,
    bookings INT,
    revenue NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(d.date, 'YYYY-MM-DD') AS date,
        COUNT(b.id)::int AS bookings,
        COALESCE(SUM(p.amount), 0)::numeric AS revenue
    FROM generate_series(CURRENT_DATE - (p_days || ' days')::interval, CURRENT_DATE, '1 day'::interval) d(date)
    LEFT JOIN public.bookings b ON DATE(b.created_at) = DATE(d.date)
    LEFT JOIN public.payments p ON DATE(p.paid_at) = DATE(d.date) AND p.status = 'completed'
    GROUP BY d.date
    ORDER BY d.date DESC;
END;
$$;
