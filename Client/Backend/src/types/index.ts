export interface ClientUser {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  status: 'active' | 'suspended' | 'inactive';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClientJwtPayload {
  id: string;
  email: string;
  status: string;
  type: 'client';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

export interface WorkspaceFilterParams {
  type?: string;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateBookingInput {
  workspaceId: string;
  startTime: string | Date;
  endTime: string | Date;
  addOns?: Array<{ addOnId: string; quantity: number }>;
  specialRequests?: string;
}

export interface BookingResult {
  id: string;
  booking_reference: string;
  client_id: string;
  workspace_id: string;
  workspace_name?: string;
  start_time: Date;
  end_time: Date;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: string;
  check_in_code: string;
  special_requests?: string;
  created_at: Date;
}
