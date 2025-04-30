
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, BookText, UserCheck, CheckCircle, Calendar, FileText } from "lucide-react";

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <BookOpen className="h-20 w-20 text-primary relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
            Exam Management System
          </h1>
          <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto leading-relaxed">
            A complete platform for students, instructors, and faculty secretaries to manage exams, grades, and resit applications
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button size="lg" className="px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-gray-50 transition-all" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">For Students</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>View your grades</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Register for resit exams</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Get notifications about exams</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <UserCheck className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">For Instructors</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Upload student grades</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Add resit exam details</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Export resit participants</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">For Faculty</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Upload exam schedules</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Update resit exam details</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Notify students of changes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
