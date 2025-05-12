
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import { useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold">Exam Management System</span>
          </div>
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Exam Management System. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

const Index = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {location.pathname === "/" ? <Landing /> : <Outlet />}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default Index;
