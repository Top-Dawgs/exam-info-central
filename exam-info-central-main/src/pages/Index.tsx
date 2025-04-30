
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  switch (user?.role) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'instructor':
      return <Navigate to="/instructor/dashboard" replace />;
    case 'faculty_secretary':
      return <Navigate to="/faculty/dashboard" replace />;
    default:
      // If role is not recognized, redirect to login
      return <Navigate to="/login" replace />;
  }
};

export default Index;
