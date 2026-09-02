-- ============================================================================
-- CoSpace Canonical PostgreSQL Database Schema (3NF Normalized)
-- Single source of truth for both Admin and Client applications
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any existing objects if re-running
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS client_favorites CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS booking_status_history CASCADE;
DROP TABLE IF EXISTS booking_add_ons CASCADE;
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS workspace_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS workspace_types CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS client_emergency_contacts CASCADE;
DROP TABLE IF EXISTS client_addresses CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ----------------------------------------------------------------------------
-- 1. Admins Table
-- ----------------------------------------------------------------------------
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'manager' CHECK (role IN ('superadmin', 'admin', 'manager', 'receptionist')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. Clients Table
-- ----------------------------------------------------------------------------
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    company_name VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. Client Addresses Table (1:N from Clients)
-- ----------------------------------------------------------------------------
CREATE TABLE client_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    address_type VARCHAR(30) NOT NULL DEFAULT 'billing' CHECK (address_type IN ('billing', 'shipping', 'home', 'business')),
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Philippines',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. Client Emergency Contacts Table (1:N from Clients)
-- ----------------------------------------------------------------------------
CREATE TABLE client_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. Client Preferences Table (1:1 from Clients)
-- ----------------------------------------------------------------------------
CREATE TABLE client_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    preferred_workspace_type VARCHAR(50),
    newsletter_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. Workspace Types Table
-- ----------------------------------------------------------------------------
CREATE TABLE workspace_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. Workspaces Table
-- ----------------------------------------------------------------------------
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_type_id UUID NOT NULL REFERENCES workspace_types(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    daily_rate NUMERIC(10, 2) NOT NULL CHECK (daily_rate >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
    floor VARCHAR(20) NOT NULL DEFAULT '1st Floor',
    room_number VARCHAR(50),
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. Amenities Table
-- ----------------------------------------------------------------------------
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. Workspace Amenities Junction Table (N:M)
-- ----------------------------------------------------------------------------
CREATE TABLE workspace_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    notes VARCHAR(255),
    UNIQUE(workspace_id, amenity_id)
);

-- ----------------------------------------------------------------------------
-- 10. Add-ons Table
-- ----------------------------------------------------------------------------
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'per_booking' CHECK (unit IN ('per_hour', 'per_day', 'per_booking', 'per_person')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. Bookings Table
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(30) NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    final_amount NUMERIC(10, 2) NOT NULL CHECK (final_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show', 'expired')),
    check_in_code VARCHAR(50) NOT NULL UNIQUE,
    special_requests TEXT,
    cancelled_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_booking_dates CHECK (end_time > start_time)
);

-- ----------------------------------------------------------------------------
-- 12. Booking Items Table (Itemized workspace slots)
-- ----------------------------------------------------------------------------
CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 13. Booking Add-ons Table (Itemized addon purchases)
-- ----------------------------------------------------------------------------
CREATE TABLE booking_add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    add_on_id UUID NOT NULL REFERENCES add_ons(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 14. Booking Status History Table (Audit Log)
-- ----------------------------------------------------------------------------
CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by_type VARCHAR(20) NOT NULL CHECK (changed_by_type IN ('client', 'admin', 'system')),
    changed_by_id UUID,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 15. Payment Methods Table
-- ----------------------------------------------------------------------------
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'paymongo',
    method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('card', 'gcash', 'grab_pay', 'paymaya', 'bank_transfer')),
    last4 VARCHAR(10),
    brand VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    provider_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 16. Payments Table
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')),
    provider VARCHAR(50) NOT NULL DEFAULT 'paymongo',
    payment_method_type VARCHAR(50) NOT NULL DEFAULT 'card',
    transaction_reference VARCHAR(150) NOT NULL UNIQUE,
    provider_payment_id VARCHAR(150),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 17. Payment Transactions Table (Webhook Logs & Provider Events)
-- ----------------------------------------------------------------------------
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 18. Refunds Table
-- ----------------------------------------------------------------------------
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
    processed_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    provider_refund_id VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 19. Client Favorites Table
-- ----------------------------------------------------------------------------
CREATE TABLE client_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, workspace_id)
);

-- ----------------------------------------------------------------------------
-- 20. Check-ins Table
-- ----------------------------------------------------------------------------
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_out_at TIMESTAMPTZ,
    method VARCHAR(30) NOT NULL DEFAULT 'qr_code' CHECK (method IN ('qr_code', 'manual_admin', 'nfc_badge')),
    verified_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 21. Notifications Table
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('client', 'admin')),
    recipient_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'reminder', 'booking', 'payment')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 22. Reviews Table
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Indexes for Performance & Concurrency Optimization
-- ----------------------------------------------------------------------------
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_workspace_id ON bookings(workspace_id);
CREATE INDEX idx_bookings_time_range ON bookings(workspace_id, start_time, end_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

CREATE INDEX idx_workspaces_type ON workspaces(workspace_type_id);
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_capacity ON workspaces(capacity);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id, is_read);
CREATE INDEX idx_checkins_booking ON check_ins(booking_id);
CREATE INDEX idx_reviews_workspace ON reviews(workspace_id);

-- ----------------------------------------------------------------------------
-- Auto-update updated_at timestamp trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_client_addresses_updated_at BEFORE UPDATE ON client_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_client_preferences_updated_at BEFORE UPDATE ON client_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspace_types_updated_at BEFORE UPDATE ON workspace_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_add_ons_updated_at BEFORE UPDATE ON add_ons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Partial Index for Active Booking Slot Conflict Checks
-- ----------------------------------------------------------------------------
CREATE INDEX idx_bookings_active_slots 
ON bookings (workspace_id, start_time, end_time) 
WHERE status IN ('pending', 'confirmed', 'active');

-- ----------------------------------------------------------------------------
-- Stored Functions & Procedures
-- ----------------------------------------------------------------------------

-- 1. fn_check_workspace_availability
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
    IF p_end_time <= p_start_time THEN
        RETURN FALSE;
    END IF;

    SELECT status INTO v_ws_status
    FROM public.workspaces
    WHERE id = p_workspace_id;

    IF v_ws_status IS NULL OR v_ws_status != 'available' THEN
        RETURN FALSE;
    END IF;

    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE workspace_id = p_workspace_id
      AND status IN ('pending', 'confirmed', 'active')
      AND (start_time < p_end_time AND end_time > p_start_time);

    RETURN (v_conflict_count = 0);
END;
$$;

-- 2. fn_create_booking_atomic
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
    v_authoritative_price NUMERIC;
    v_final_unit_price NUMERIC;
    v_final_subtotal NUMERIC;
BEGIN
    IF p_end_time <= p_start_time THEN
        RAISE EXCEPTION 'End time must be after start time' USING ERRCODE = '22023';
    END IF;

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

    SELECT b.id INTO v_conflict_id
    FROM public.bookings b
    WHERE b.workspace_id = p_workspace_id
      AND b.status IN ('pending', 'confirmed', 'active')
      AND (b.start_time < p_end_time AND b.end_time > p_start_time)
    LIMIT 1
    FOR UPDATE;

    IF v_conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'The selected time slot was just booked by another member.' USING ERRCODE = '23P01';
    END IF;

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

    IF p_add_ons IS NOT NULL AND jsonb_array_length(p_add_ons) > 0 THEN
        FOR v_addon IN 
            SELECT 
                COALESCE((elem->>'add_on_id')::UUID, (elem->>'addOnId')::UUID, (elem->>'id')::UUID) AS add_on_id,
                COALESCE((elem->>'quantity')::INT, 1) AS quantity,
                (elem->>'unit_price')::NUMERIC AS explicit_unit_price,
                (elem->>'unitPrice')::NUMERIC AS explicit_unit_price_camel,
                (elem->>'subtotal')::NUMERIC AS explicit_subtotal
            FROM jsonb_array_elements(p_add_ons) AS elem
        LOOP
            IF v_addon.add_on_id IS NOT NULL THEN
                SELECT ao.price INTO v_authoritative_price
                FROM public.add_ons ao
                WHERE ao.id = v_addon.add_on_id AND ao.is_active = TRUE;

                v_final_unit_price := COALESCE(
                    v_authoritative_price,
                    v_addon.explicit_unit_price,
                    v_addon.explicit_unit_price_camel,
                    0.00
                );

                v_final_subtotal := COALESCE(
                    v_addon.explicit_subtotal,
                    ROUND(v_final_unit_price * GREATEST(1, v_addon.quantity), 2)
                );

                INSERT INTO public.booking_add_ons (
                    booking_id,
                    add_on_id,
                    quantity,
                    unit_price,
                    subtotal
                )
                VALUES (
                    v_booking_id,
                    v_addon.add_on_id,
                    GREATEST(1, v_addon.quantity),
                    v_final_unit_price,
                    v_final_subtotal
                );
            END IF;
        END LOOP;
    END IF;

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

-- 3. fn_cancel_booking_atomic
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

-- 4. fn_get_admin_dashboard_kpis
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
    SELECT COALESCE(SUM(amount), 0) INTO v_today_revenue
    FROM public.payments
    WHERE status = 'completed' AND paid_at >= CURRENT_DATE;

    SELECT COUNT(b.id)::int INTO v_today_bookings
    FROM public.bookings b
    WHERE b.created_at >= CURRENT_DATE;

    SELECT COUNT(ci.id)::int INTO v_active_visitors
    FROM public.check_ins ci
    WHERE ci.checked_in_at >= CURRENT_DATE AND ci.checked_out_at IS NULL;

    SELECT COUNT(ws.id)::int INTO v_avail_ws FROM public.workspaces ws WHERE ws.status = 'available';
    SELECT COUNT(ws.id)::int INTO v_total_ws FROM public.workspaces ws;

    IF v_total_ws > 0 THEN
        v_occupancy := ROUND(((v_total_ws - v_avail_ws)::numeric / v_total_ws::numeric) * 100)::int;
        IF v_occupancy < 0 THEN v_occupancy := 0; END IF;
    ELSE
        v_occupancy := 0;
    END IF;

    SELECT COUNT(b.id)::int INTO v_pending_bks FROM public.bookings b WHERE b.status = 'pending';

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

-- 5. fn_get_admin_daily_breakdown
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

