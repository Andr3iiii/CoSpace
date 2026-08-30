export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'admin' | 'manager' | 'receptionist';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_type?: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show' | 'expired';
  check_in_code: string;
  special_requests?: string;
  cancelled_reason?: string;
  cancelled_at?: string;
  created_at: string;
  items?: Array<{ id: string; description: string; unit_price: number; quantity: number; subtotal: number }>;
  addOns?: Array<{ id: string; name: string; quantity: number; unit_price: number; subtotal: number; unit: string }>;
  history?: Array<{ id: string; from_status: string; to_status: string; changed_by_type: string; reason: string; created_at: string }>;
  payment?: Payment;
}

export interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  status: 'active' | 'suspended' | 'inactive';
  avatar_url?: string;
  created_at: string;
  total_bookings?: number;
  total_spent?: number;
  addresses?: any[];
  emergencyContacts?: any[];
  preferences?: any;
  recentBookings?: any[];
}

export interface Workspace {
  id: string;
  workspace_type_id: string;
  workspace_type?: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  hourly_rate: number;
  daily_rate: number;
  status: 'available' | 'maintenance' | 'inactive';
  floor: string;
  room_number?: string;
  images: string[];
  is_featured: boolean;
  amenities?: any[];
}

export interface Payment {
  id: string;
  booking_id: string;
  booking_reference?: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  provider: string;
  payment_method_type: string;
  transaction_reference: string;
  paid_at?: string;
  created_at: string;
  transactions?: any[];
  refunds?: any[];
}

export interface DashboardKpis {
  todayRevenue: number;
  todayBookings: number;
  activeVisitors: number;
  availableWorkspaces: number;
  occupancyRate: number;
  pendingBookings: number;
  pendingPayments: number;
}
