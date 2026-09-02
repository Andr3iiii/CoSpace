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
  paymentPlan?: 'full' | 'deposit_50';
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
  hold_expires_at?: Date | null;
  payment_plan: 'full' | 'deposit_50';
  paid_amount: number;
  remaining_balance: number;
  created_at: Date;
}

export interface EmailVerification {
  id: string;
  email: string;
  otp_hash: string;
  expires_at: Date;
  attempts: number;
  max_attempts: number;
  is_verified: boolean;
  verified_at?: Date | null;
  last_sent_at: Date;
  created_at: Date;
}

export interface EmailVerificationOtp {
  id: string;
  email: string;
  otp_hash: string;
  expires_at: Date;
  attempts: number;
  max_attempts: number;
  is_verified: boolean;
  verified_at?: Date | null;
  is_invalidated: boolean;
  invalidated_reason?: string | null;
  verification_token?: string | null;
  token_expires_at?: Date | null;
  is_consumed: boolean;
  consumed_at?: Date | null;
  last_sent_at: Date;
  created_at: Date;
}


