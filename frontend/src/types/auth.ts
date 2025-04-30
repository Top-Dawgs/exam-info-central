
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'faculty_secretary';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'faculty_secretary';
}

export interface AuthResponse {
  user: User;
  token: string;
}
