// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
}

// Company types
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "pending" | "inactive";
  adminEmail?: string;
  adminId?: string;
  extensionsInstalled?: boolean;
  [key: string]: any;
}

// API fetch options
export interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

// Get token function type
export type GetTokenFunction = () => Promise<string | null>;
