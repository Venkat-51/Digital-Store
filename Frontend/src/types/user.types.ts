// ============================================================
// User / Auth Types
// ============================================================

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface Address {
  id: number;
  label: string; // e.g. "Home", "Office"
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  phone?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
