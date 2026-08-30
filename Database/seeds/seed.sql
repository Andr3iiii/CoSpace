-- ============================================================================
-- CoSpace Seed Data (Development Data with bcrypt hashed passwords)
-- Admin: admin@cospace.com / Admin@123456
-- Client: client@cospace.com / Client@123456
-- Password hashes generated with bcrypt (10 rounds)
-- ============================================================================

-- 1. Admins
INSERT INTO admins (id, email, password_hash, first_name, last_name, role, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@cospace.com', '$2b$10$iVmODMipnSR61sDWy56zqu5Ns4gZPjwAqcl2I1kRn2sooRVl6fv4O', 'Alex', 'Vance', 'superadmin', TRUE),
('a0000000-0000-0000-0000-000000000002', 'manager@cospace.com', '$2b$10$iVmODMipnSR61sDWy56zqu5Ns4gZPjwAqcl2I1kRn2sooRVl6fv4O', 'Sarah', 'Connor', 'manager', TRUE),
('a0000000-0000-0000-0000-000000000003', 'reception@cospace.com', '$2b$10$iVmODMipnSR61sDWy56zqu5Ns4gZPjwAqcl2I1kRn2sooRVl6fv4O', 'Liam', 'Miller', 'receptionist', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. Clients
INSERT INTO clients (id, email, password_hash, first_name, last_name, phone, company_name, status, avatar_url) VALUES
('c0000000-0000-0000-0000-000000000001', 'client@cospace.com', '$2b$10$6O95JpBQO63erYbEw7nLTuz1UoSZEbgerhMS3GY8YNDtGHi2IIP1.', 'John', 'Doe', '+63 917 123 4567', 'Acme Innovations', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('c0000000-0000-0000-0000-000000000002', 'maria.santos@techflow.io', '$2b$10$6O95JpBQO63erYbEw7nLTuz1UoSZEbgerhMS3GY8YNDtGHi2IIP1.', 'Maria', 'Santos', '+63 918 987 6543', 'TechFlow Studio', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
('c0000000-0000-0000-0000-000000000003', 'david.kim@apexdev.com', '$2b$10$6O95JpBQO63erYbEw7nLTuz1UoSZEbgerhMS3GY8YNDtGHi2IIP1.', 'David', 'Kim', '+63 920 555 0192', 'Apex Digital', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('c0000000-0000-0000-0000-000000000004', 'elena.rodriguez@designhub.co', '$2b$10$6O95JpBQO63erYbEw7nLTuz1UoSZEbgerhMS3GY8YNDtGHi2IIP1.', 'Elena', 'Rodriguez', '+63 917 888 1234', 'DesignHub PH', 'suspended', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 3. Client Addresses
INSERT INTO client_addresses (client_id, address_type, street_line1, city, state_province, postal_code, is_default) VALUES
('c0000000-0000-0000-0000-000000000001', 'billing', '7th Ave, Bonifacio Global City', 'Taguig', 'Metro Manila', '1634', TRUE),
('c0000000-0000-0000-0000-000000000002', 'billing', 'Ayala Triangle Gardens', 'Makati', 'Metro Manila', '1226', TRUE)
ON CONFLICT DO NOTHING;

-- 4. Client Preferences
INSERT INTO client_preferences (client_id, preferred_workspace_type, newsletter_opt_in, sms_notifications, email_notifications, dark_mode) VALUES
('c0000000-0000-0000-0000-000000000001', 'dedicated_desk', TRUE, TRUE, TRUE, FALSE),
('c0000000-0000-0000-0000-000000000002', 'private_office', TRUE, FALSE, TRUE, TRUE),
('c0000000-0000-0000-0000-000000000003', 'meeting_room', FALSE, TRUE, TRUE, FALSE)
ON CONFLICT (client_id) DO NOTHING;

-- 5. Workspace Types
INSERT INTO workspace_types (id, name, slug, description, icon, is_active) VALUES
('e1000000-0000-0000-0000-000000000001', 'Hot Desk', 'hot-desk', 'Flexible, unassigned seating in vibrant open-plan areas with high-speed internet and cafe access.', 'Laptop', TRUE),
('e1000000-0000-0000-0000-000000000002', 'Dedicated Desk', 'dedicated-desk', 'Your personal permanent desk in a quiet shared office with lockable storage.', 'Armchair', TRUE),
('e1000000-0000-0000-0000-000000000003', 'Private Office', 'private-office', 'Fully enclosed, secure private office suites tailored for growing teams of 2 to 20.', 'Building2', TRUE),
('e1000000-0000-0000-0000-000000000004', 'Meeting Room', 'meeting-room', 'High-tech conference rooms with 4K video conferencing, whiteboards, and acoustics.', 'Users', TRUE),
('e1000000-0000-0000-0000-000000000005', 'Event Space', 'event-space', 'Spacious multipurpose hall equipped for workshops, product demos, and community meetups.', 'Sparkles', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 6. Amenities
INSERT INTO amenities (id, name, icon, category, description) VALUES
('e2000000-0000-0000-0000-000000000001', 'Gigabit Fiber WiFi', 'Wifi', 'connectivity', 'Ultra-low latency 1 Gbps redundant fiber internet with enterprise mesh security.'),
('e2000000-0000-0000-0000-000000000002', 'Ergonomic Herman Miller Seating', 'Sparkles', 'comfort', 'Aeron and Embody chairs designed for all-day focus and spinal support.'),
('e2000000-0000-0000-0000-000000000003', 'Artisan Coffee & Kombucha Bar', 'Coffee', 'refreshment', 'Unlimited single-origin espresso drinks, specialty teas, and cold drinks.'),
('e2000000-0000-0000-0000-000000000004', '4K Video Conference Display', 'Tv', 'technology', '75-inch UHD Smart Displays with automated camera auto-framing.'),
('e2000000-0000-0000-0000-000000000005', 'Soundproof Phone Booths', 'PhoneCall', 'privacy', 'Acoustic booths for private client calls and video pitches.'),
('e2000000-0000-0000-0000-000000000006', 'Secure Access Control & Lockers', 'Lock', 'security', 'Keyless mobile-app entry with 24/7 CCTV surveillance.')
ON CONFLICT (name) DO NOTHING;

-- 7. Workspaces
INSERT INTO workspaces (id, workspace_type_id, name, slug, description, capacity, hourly_rate, daily_rate, status, floor, room_number, images, is_featured) VALUES
('e3000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'The Commons - Open Lounge Desks', 'commons-open-lounge', 'Sunlit open-plan area featuring power hubs at every seat, natural timber tables, and immediate access to the barista bar.', 24, 150.00, 850.00, 'available', '3rd Floor', '301-A', '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80"]'::jsonb, TRUE),
('e3000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'Focus Pod - Dedicated Desk #08', 'focus-pod-desk-08', 'Fixed workstation with dual 27-inch monitor mounts, Herman Miller Aeron chair, and personal locking file cabinet.', 1, 200.00, 1200.00, 'available', '3rd Floor', 'Desk-08', '["https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1000&auto=format&fit=crop&q=80"]'::jsonb, TRUE),
('e3000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'Executive Studio - Suite 402', 'executive-studio-402', 'Private 6-person glass suite with frosted soundproofing, motorized sit-stand desks, and dedicated HVAC control.', 6, 950.00, 6000.00, 'available', '4th Floor', 'Suite 402', '["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000&auto=format&fit=crop&q=80"]'::jsonb, TRUE),
('e3000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', 'Summit Boardroom', 'summit-boardroom', 'Premium 14-person conference room with Cisco Webex dual 4K screens, magnetic glass whiteboards, and catered service options.', 14, 1500.00, 9500.00, 'available', '4th Floor', 'Boardroom A', '["https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1000&auto=format&fit=crop&q=80"]'::jsonb, TRUE),
('e3000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000005', 'The Amphitheater Hall', 'amphitheater-hall', 'Tiered presentation auditorium equipped with line-array audio, wireless microphones, and livestream switching deck.', 60, 4500.00, 28000.00, 'available', '2nd Floor', 'Auditorium', '["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000&auto=format&fit=crop&q=80"]'::jsonb, FALSE)
ON CONFLICT (slug) DO NOTHING;

-- 8. Workspace Amenities Junction
INSERT INTO workspace_amenities (workspace_id, amenity_id, quantity) VALUES
('e3000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 1),
('e3000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000003', 1),
('e3000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000001', 1),
('e3000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000002', 1),
('e3000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000001', 1),
('e3000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000004', 1),
('e3000000-0000-0000-0000-000000000004', 'e2000000-0000-0000-0000-000000000001', 1),
('e3000000-0000-0000-0000-000000000004', 'e2000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- 9. Add-ons
INSERT INTO add_ons (id, name, description, price, unit, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', '4K 27-inch Dell UltraSharp Monitor', 'Plug-and-play USB-C monitor with 90W power delivery.', 250.00, 'per_booking', TRUE),
('d0000000-0000-0000-0000-000000000002', 'Reserved Basement Parking Pass', 'Secure underground parking bay for the full day duration.', 300.00, 'per_day', TRUE),
('d0000000-0000-0000-0000-000000000003', 'Podcaster Shure MV7 & Boom Arm Kit', 'Broadcast quality microphone, shockmount, and sound baffle.', 400.00, 'per_booking', TRUE),
('d0000000-0000-0000-0000-000000000004', 'Gourmet Catering Pastry Platter (10 pax)', 'Assorted croissants, danishes, and fresh fruit skewers.', 1200.00, 'per_booking', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 10. Sample Bookings
INSERT INTO bookings (id, booking_reference, client_id, workspace_id, start_time, end_time, total_amount, discount_amount, final_amount, status, check_in_code, special_requests) VALUES
('b0000000-0000-0000-0000-000000000001', 'CSP-2026-8801', 'c0000000-0000-0000-0000-000000000001', 'e3000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day 8 hours', 1200.00, 0.00, 1200.00, 'confirmed', 'QR-8801-CHK', 'Please ensure dual monitors are calibrated.'),
('b0000000-0000-0000-0000-000000000002', 'CSP-2026-8802', 'c0000000-0000-0000-0000-000000000002', 'e3000000-0000-0000-0000-000000000004', CURRENT_TIMESTAMP + INTERVAL '2 days 2 hours', CURRENT_TIMESTAMP + INTERVAL '2 days 6 hours', 6000.00, 500.00, 5500.00, 'confirmed', 'QR-8802-CHK', 'Client pitch presentation. Need HDMI and USB-C adapters.'),
('b0000000-0000-0000-0000-000000000003', 'CSP-2026-8799', 'c0000000-0000-0000-0000-000000000003', 'e3000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '8 hours', 850.00, 0.00, 850.00, 'completed', 'QR-8799-CHK', NULL)
ON CONFLICT (booking_reference) DO NOTHING;

-- 11. Booking Items & History
INSERT INTO booking_items (booking_id, description, unit_price, quantity, subtotal) VALUES
('b0000000-0000-0000-0000-000000000001', 'Focus Pod - Dedicated Desk #08 (Full Day)', 1200.00, 1, 1200.00),
('b0000000-0000-0000-0000-000000000002', 'Summit Boardroom (4 Hours)', 1500.00, 4, 6000.00)
ON CONFLICT DO NOTHING;

INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_type, reason) VALUES
('b0000000-0000-0000-0000-000000000001', 'pending', 'confirmed', 'client', 'Payment settled via PayMongo GCash'),
('b0000000-0000-0000-0000-000000000002', 'pending', 'confirmed', 'client', 'Payment settled via PayMongo Visa Card')
ON CONFLICT DO NOTHING;

-- 12. Payments
INSERT INTO payments (id, booking_id, client_id, amount, currency, status, provider, payment_method_type, transaction_reference, provider_payment_id, paid_at) VALUES
('e4000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1200.00, 'PHP', 'completed', 'paymongo', 'gcash', 'TXN-PM-2026-001', 'pay_gcash_991823719', CURRENT_TIMESTAMP),
('e4000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 5500.00, 'PHP', 'completed', 'paymongo', 'card', 'TXN-PM-2026-002', 'pay_card_448201934', CURRENT_TIMESTAMP)
ON CONFLICT (transaction_reference) DO NOTHING;

-- 13. Reviews
INSERT INTO reviews (client_id, workspace_id, booking_id, rating, comment, is_published) VALUES
('c0000000-0000-0000-0000-000000000003', 'e3000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 5, 'Super fast internet, fantastic coffee, and very friendly community team!', TRUE)
ON CONFLICT DO NOTHING;

-- 14. Notifications
INSERT INTO notifications (recipient_type, recipient_id, title, message, type, is_read, action_url) VALUES
('client', 'c0000000-0000-0000-0000-000000000001', 'Booking Confirmed!', 'Your reservation for Focus Pod #08 is confirmed. Check-in code is QR-8801-CHK.', 'booking', FALSE, '/bookings/b0000000-0000-0000-0000-000000000001'),
('admin', 'a0000000-0000-0000-0000-000000000001', 'New Boardroom Booking', 'Maria Santos booked Summit Boardroom for PHP 5,500.', 'payment', FALSE, '/admin/bookings/b0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;
