export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DELIVERY_PARTNER' | 'CUSTOMER';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  isLoyalty: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorField {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    fields?: ApiErrorField[];
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: SafeUser;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DELIVERY_PARTNER';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'DELIVERY_PARTNER';
}

export interface FieldErrors {
  [field: string]: string;
}

export interface AuthContextValue {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface ApiError {
  message: string;
  fields?: ApiErrorField[];
}
