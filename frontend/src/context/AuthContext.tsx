
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import API from '../api/axios';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if user is already logged in
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await API.get('/api/verify');
          // Adapt to your backend response structure
          const userData = response.data.user || {
            id: response.data.userId || response.data.id,
            name: response.data.name || response.data.username || 'User',
            email: response.data.email || '',
            role: response.data.role || 'student'
          };
          
          setState({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    verifyToken();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await API.post('/api/login', credentials);
      // Adapt to your backend response structure
      const token = response.data.token;
      
      // Create a user object from whatever data your backend provides
      const userData = response.data.user; // use exactly what your backend sends

      
      localStorage.setItem('token', token);
      setState({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      
      toast({
        title: 'Login Successful',
        description: `Welcome back!`,
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await API.post('/api/register', credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'Unable to register. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
