# CoSpace Database Architecture & 3NF Normalization

CoSpace uses a single PostgreSQL database normalized to Third Normal Form (3NF).

---

## 1. Entity-Relationship Overview

```text
admins ─────────┐
                │
clients ────────┼───────────────────┬────────────────────┬─────────────────┐
  │             │                   │                    │                 │
  ├─ client_addresses               │                    │                 │
  ├─ client_emergency_contacts      │                    │                 │
  ├─ client_preferences             │                    │                 │
  │                                 │                    │                 │
  ▼                                 ▼                    ▼                 ▼
bookings ◄──────────────────── payments ◄────────── refunds     client_favorites
  │                                 │
  ├─ booking_items                  └─ payment_transactions
  ├─ booking_add_ons
  ├─ booking_status_history
  ├─ check_ins
  │
  ▼
workspaces ◄─────────── workspace_amenities ───────────► amenities
  │
  ├─ workspace_types
  └─ reviews
```

---

## 2. Table Specifications

### Core User & Client Tables
1. `admins`: System administrators and staff (`id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`, `created_at`, `updated_at`).
2. `clients`: Coworking members (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `company_name`, `status`, `avatar_url`, `created_at`, `updated_at`).
3. `client_addresses`: Billing and physical mailing addresses (`id`, `client_id`, `type`, `street`, `city`, `state`, `postal_code`, `country`, `is_default`).
4. `client_emergency_contacts`: Safety contacts (`id`, `client_id`, `name`, `relationship`, `phone`, `email`).
5. `client_preferences`: Member preferences (`id`, `client_id`, `preferred_workspace_type`, `newsletter_opt_in`, `sms_notifications`, `dark_mode`).

### Workspace & Inventory Tables
6. `workspace_types`: Category taxonomy (`id`, `name`, `slug`, `description`, `icon`, `is_active`).
7. `workspaces`: Physical inventory spaces (`id`, `workspace_type_id`, `name`, `slug`, `description`, `capacity`, `hourly_rate`, `daily_rate`, `status`, `floor`, `room_number`, `images`, `is_featured`, `created_at`, `updated_at`).
8. `amenities`: Facilities and perks (`id`, `name`, `icon`, `description`, `category`).
9. `workspace_amenities`: Junction table (`id`, `workspace_id`, `amenity_id`, `quantity`, `notes`).
10. `add_ons`: Billable add-ons (`id`, `name`, `description`, `price`, `unit`, `is_active`).

### Booking & Reservation Tables
11. `bookings`: Reservation contracts (`id`, `client_id`, `workspace_id`, `start_time`, `end_time`, `total_amount`, `discount_amount`, `final_amount`, `status`, `check_in_code`, `special_requests`, `created_at`, `updated_at`).
12. `booking_items`: Breakdown of reserved slots (`id`, `booking_id`, `unit_type`, `unit_price`, `quantity`, `subtotal`).
13. `booking_add_ons`: Purchased add-ons (`id`, `booking_id`, `add_on_id`, `quantity`, `unit_price`, `subtotal`).
14. `booking_status_history`: Audit trail (`id`, `booking_id`, `from_status`, `to_status`, `changed_by_type`, `changed_by_id`, `reason`, `created_at`).
15. `check_ins`: On-site attendance (`id`, `booking_id`, `client_id`, `checked_in_at`, `checked_out_at`, `method`, `verified_by_admin_id`).

### Billing & Payment Tables
16. `payment_methods`: Saved payment options (`id`, `client_id`, `provider`, `method_type`, `last4`, `brand`, `is_default`, `provider_token`).
17. `payments`: Payment intents & executions (`id`, `booking_id`, `client_id`, `amount`, `currency`, `status`, `provider`, `transaction_reference`, `paid_at`, `created_at`).
18. `payment_transactions`: Raw provider logs (`id`, `payment_id`, `event_type`, `provider_response`, `created_at`).
19. `refunds`: Reversals and returns (`id`, `payment_id`, `amount`, `reason`, `status`, `processed_by_admin_id`, `created_at`).

### Community & Auxiliary Tables
20. `client_favorites`: Saved bookmarks (`id`, `client_id`, `workspace_id`, `created_at`).
21. `notifications`: In-app notification feed (`id`, `recipient_type`, `recipient_id`, `title`, `message`, `type`, `is_read`, `action_url`, `created_at`).
22. `reviews`: Member reviews and ratings (`id`, `client_id`, `workspace_id`, `booking_id`, `rating`, `comment`, `is_published`, `created_at`).
