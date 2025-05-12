
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
          // Map backend user object to our frontend User type
          const userData: User = {
            id: response.data.user.user_id,
            name: response.data.user.email.split('@')[0], // Use email prefix as name
            email: response.data.user.email,
            role: response.data.user.role,
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
      
      // Get token from response
      const token = response.data.token;
      
      // Map the backend user object to our frontend User type
      const userData: User = {
        id: response.data.user.user_id,
        name: response.data.user.email.split('@')[0], // Use email prefix as name
        email: response.data.user.email,
        role: response.data.user.role,
      };
      
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
      
      // After registration, we need to log the user in
      await login({ 
        email: credentials.email, 
        password: credentials.password 
      });
      
      toast({
        title: 'Registration Successful',
        description: `Welcome!`,
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
