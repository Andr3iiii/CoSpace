export interface ClientUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  status: 'active' | 'suspended' | 'inactive';
  avatar_url?: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  workspace_type_id: string;
  workspace_type: string;
  type_slug: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  hourly_rate: number;
  daily_rate: number;
  floor: string;
  room_number?: string;
  images: string[];
  is_featured: boolean;
  average_rating: number;
  review_count: number;
  amenities?: Array<{ id: string; name: string; icon: string; category: string; quantity: number; notes?: string }>;
  availableAddOns?: Array<{ id: string; name: string; description: string; price: number; unit: string }>;
  reviews?: Array<{ id: string; rating: number; comment: string; created_at: string; client_name: string; avatar_url?: string }>;
}

export interface Booking {
  id: string;
  booking_reference: string;
  workspace_id: string;
  workspace_name: string;
  workspace_type: string;
  floor?: string;
  room_number?: string;
  images?: string[];
  start_time: string;
  end_time: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show' | 'expired';
  check_in_code: string;
  special_requests?: string;
  created_at: string;
  payment_status?: string;
  payment_method_type?: string;
  items?: any[];
  addOns?: any[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
