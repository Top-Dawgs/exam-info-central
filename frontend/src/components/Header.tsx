
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Bell, 
  Calendar, 
  Upload, 
  LogOut, 
  Menu, 
  X
} from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    const commonLinks = [
      { text: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    ];

    if (user.role === "student") {
      return [
        ...commonLinks,
        { text: "My Grades", href: "/student/grades", icon: <FileText className="h-4 w-4 mr-2" /> },
        { text: "Resit Exams", href: "/student/resit-exams", icon: <Calendar className="h-4 w-4 mr-2" /> },
        { text: "Notifications", href: "/student/notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
      ];
    }

    if (user.role === "instructor") {
      return [
        ...commonLinks,
        { text: "Upload Grades", href: "/instructor/upload-grades", icon: <Upload className="h-4 w-4 mr-2" /> },
        { text: "Resit Exams", href: "/instructor/resit-exams", icon: <Calendar className="h-4 w-4 mr-2" /> },
        { text: "Notifications", href: "/instructor/notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
      ];
    }

    if (user.role === "faculty_secretary") {
      return [
        ...commonLinks,
        { text: "Upload Schedule", href: "/faculty/upload-schedule", icon: <Upload className="h-4 w-4 mr-2" /> },
        { text: "Manage Resits", href: "/faculty/manage-resits", icon: <Calendar className="h-4 w-4 mr-2" /> },
        { text: "Notifications", href: "/faculty/notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <BookOpen className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl">Exam Management System</span>
          </Link>

          {/* Mobile menu toggle */}
          {user && (
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMobileMenu}
                className="text-white hover:bg-white/20"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}

          {/* Desktop navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-white/20 transition-colors"
                >
                  {link.icon}
                  {link.text}
                </Link>
              ))}
              <div className="ml-4 flex items-center space-x-2">
                <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </nav>
          )}
        </div>

        {/* Mobile navigation */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2 pb-3 border-t border-white/20 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 transition-colors"
                onClick={toggleMobileMenu}
              >
                {link.icon}
                {link.text}
              </Link>
            ))}
            <div className="pt-2 flex flex-col space-y-2">
              <span className="text-sm px-3">{user.email}</span>
              <Button
                variant="outline"
                onClick={logout}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-700 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
