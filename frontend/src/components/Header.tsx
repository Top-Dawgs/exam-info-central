
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      role: ["student", "instructor", "faculty_secretary"],
    },
    // Student routes
    { name: "My Grades", path: "/student/grades", role: ["student"] },
    { name: "Resit Exams", path: "/student/resit-exams", role: ["student"] },
    {
      name: "Notifications",
      path: "/student/notifications",
      role: ["student"],
    },
    // Instructor routes
    {
      name: "Upload Grades",
      path: "/instructor/upload-grades",
      role: ["instructor"],
    },
    {
      name: "Manage Resits",
      path: "/instructor/resit-exams",
      role: ["instructor"],
    },
    {
      name: "View Registrations",
      path: "/instructor/registrations",
      role: ["instructor"],
    },
    {
      name: "Send Notifications",
      path: "/instructor/notifications",
      role: ["instructor"],
    },
    // Faculty secretary routes
    {
      name: "Upload Schedule",
      path: "/faculty/upload-schedule",
      role: ["faculty_secretary"],
    },
    {
      name: "Manage Resits",
      path: "/faculty/manage-resits",
      role: ["faculty_secretary"],
    },
    {
      name: "Send Notifications",
      path: "/faculty/notifications",
      role: ["faculty_secretary"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    return item.role.includes(user.role);
  });

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              ReSit
            </span>
          </Link>

          {/* Desktop navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                    isActive(item.path)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-2">
                  {user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="ml-2"
                >
                  Login
                </Button>
              )}
              {location.pathname !== "/register" && (
                <Button
                  onClick={() => navigate("/register")}
                  className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
                >
                  Register
                </Button>
              )}
            </>
          )}

          {/* Mobile menu button */}
          {isMobile && isAuthenticated && (
            <Button
              variant="outline"
              size="icon"
              className="md:hidden ml-2"
              onClick={toggleMenu}
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {isMobile && isOpen && isAuthenticated && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium px-3 py-2 rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
