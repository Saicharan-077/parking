// Import axios for HTTP requests
import axios from 'axios';

// Base URL for API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6228/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token and log requests
api.interceptors.request.use(
  (config) => {
    // Add JWT token to request headers if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Log outgoing API requests
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling API errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log API errors for debugging
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// TypeScript interfaces for API data structures

// Vehicle data structure
export interface Vehicle {
  id?: number; // Optional ID for new vehicles
  vehicle_type: 'car' | 'bike' | 'ev'; // Type of vehicle
  vehicle_number: string; // Unique vehicle registration number
  model?: string; // Vehicle model (optional)
  color?: string; // Vehicle color (optional)
  is_ev: boolean; // Electric vehicle flag
  owner_name: string; // Owner's full name
  email: string; // Owner's email address
  phone_number?: string; // Phone number (optional)
  employee_student_id: string; // Employee or student ID
  created_at?: string; // Creation timestamp (optional)
  updated_at?: string; // Update timestamp (optional)
}

// Vehicle statistics structure
export interface VehicleStats {
  total_vehicles: number; // Total number of vehicles
  total_ev: number; // Total electric vehicles
  total_cars: number; // Total cars
  total_bikes: number; // Total bikes
}

// User data structure
export interface User {
  id: number; // User ID
  username: string; // Unique username
  email: string; // User email
  role: 'user' | 'admin'; // User role
  phone_number?: string; // Phone number (optional)
  employee_student_id?: string; // Employee/Student ID (optional)
  profile_picture?: string; // Profile picture URL (optional)
  created_at: string; // Account creation date
}

// Login request structure
export interface LoginRequest {
  email: string; // User's email
  password: string; // User's password
}

// Registration request structure
export interface RegisterRequest {
  username: string; // Desired username
  email: string; // User's email (must be @vnrvjiet.in)
  password: string; // User's password
  phoneNumber?: string; // Optional phone number
  employeeStudentId: string; // Required employee/student ID
  role?: 'user' | 'admin'; // Optional role (defaults to 'user')
}

// Profile update request structure
export interface UpdateProfileRequest {
  username?: string; // Updated username
  phoneNumber?: string; // Updated phone number
  employeeStudentId?: string; // Updated employee/student ID
  profilePicture?: string; // Updated profile picture URL
}

// Verification request structures
export interface SendEmailVerificationRequest {
  email: string;
  phoneNumber: string;
}

export interface SendPhoneVerificationRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  email?: string;
  phoneNumber?: string;
  otp: string;
}

// Password reset request structures
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Authentication response structure
export interface AuthResponse {
  message: string; // Response message
  user: User; // User data
  token: string; // JWT authentication token
}

// Export statistics structure
export interface ExportStats {
  totalVehicles: number; // Total vehicles exported
  evVehicles: number; // Electric vehicles count
  carVehicles: number; // Car count
  bikeVehicles: number; // Bike count
  exportDate: string; // Date of export
}

// Vehicle API functions - CRUD operations and queries for vehicles
export const vehicleApi = {
  // Register a new vehicle in the system
  register: async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/vehicles', vehicleData);
    return response.data;
  },

  // Search vehicles by query string
  search: async (query: string): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Get all vehicles with pagination
  getAll: async (limit = 50, offset = 0): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Get specific vehicle by ID
  getById: async (id: number): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  // Update vehicle information
  update: async (id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  // Delete vehicle from system
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/vehicles/${id}`);
    return response.data;
  },

  // Get vehicle statistics and counts
  getStats: async (): Promise<VehicleStats> => {
    const response = await api.get<VehicleStats>('/vehicles/stats');
    return response.data;
  }
};

// Authentication API functions - user registration, login, and profile management
export const authApi = {
  // Register a new user account
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Authenticate user and get access token
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Get current authenticated user's profile
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  },

  // Update current authenticated user's profile
  updateProfile: async (profileData: UpdateProfileRequest): Promise<{ message: string; user: User }> => {
    const response = await api.put<{ message: string; user: User }>('/auth/profile', profileData);
    return response.data;
  },

  // Send email verification OTP
  sendEmailVerification: async (data: SendEmailVerificationRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/send-email-verification', data);
    return response.data;
  },

  // Send phone verification OTP
  sendPhoneVerification: async (data: SendPhoneVerificationRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/send-phone-verification', data);
    return response.data;
  },

  // Verify email OTP
  verifyEmailOTP: async (data: VerifyOTPRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-email-otp', data);
    return response.data;
  },

  // Verify phone OTP
  verifyPhoneOTP: async (data: VerifyOTPRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-phone-otp', data);
    return response.data;
  },

  // Request password reset
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password with token
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  // Google OAuth login
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google-login', { credential });
    return response.data;
  }
};

// Export API functions - data export functionality for vehicles
export const exportApi = {
  // Export vehicle data as CSV file
  exportCSV: async (): Promise<Blob> => {
    const response = await api.get('/exports/vehicles/csv', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export vehicle data as PDF file
  exportPDF: async (): Promise<Blob> => {
    const response = await api.get('/exports/vehicles/pdf', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get statistics about exported data
  getExportStats: async (): Promise<ExportStats> => {
    const response = await api.get<ExportStats>('/exports/stats');
    return response.data;
  }
};

// Export the configured axios instance as default
export default api;
