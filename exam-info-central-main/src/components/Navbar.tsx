
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard' },
          { to: '/student/grades', label: 'My Grades' },
          { to: '/student/resit-exams', label: 'Resit Exams' },
          { to: '/student/notifications', label: 'Notifications' },
        ];
      case 'instructor':
        return [
          { to: '/instructor/dashboard', label: 'Dashboard' },
          { to: '/instructor/upload-grades', label: 'Upload Grades' },
          { to: '/instructor/resit-details', label: 'Resit Details' },
          { to: '/instructor/notifications', label: 'Send Notifications' },
        ];
      case 'faculty_secretary':
        return [
          { to: '/faculty/dashboard', label: 'Dashboard' },
          { to: '/faculty/upload-schedule', label: 'Upload Schedule' },
          { to: '/faculty/update-resit', label: 'Update Resit Info' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Exam Info Central
            </Link>
          </div>

          <nav className="hidden md:flex space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
