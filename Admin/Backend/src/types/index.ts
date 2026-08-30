export interface AdminUser {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'admin' | 'manager' | 'receptionist';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: string;
  type: 'admin';
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

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingDetails {
  id: string;
  booking_reference: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_type?: string;
  start_time: string | Date;
  end_time: string | Date;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show' | 'expired';
  check_in_code: string;
  special_requests?: string;
  cancelled_reason?: string;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}
