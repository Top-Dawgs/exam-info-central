
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import GradesPage from "./pages/student/Grades";
import ResitExamsPage from "./pages/student/ResitExams";
import NotificationsPage from "./pages/student/Notifications";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/Dashboard";
import UploadGradesPage from "./pages/instructor/UploadGrades";
import ResitDetailsPage from "./pages/instructor/ResitDetails";
import InstructorNotificationsPage from "./pages/instructor/Notifications";

// Faculty Secretary Pages
import FacultyDashboard from "./pages/faculty/Dashboard";
import UploadSchedulePage from "./pages/faculty/UploadSchedule";
import UpdateResitPage from "./pages/faculty/UpdateResit";

// Create Query Client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route path="/" element={<Layout><RedirectBasedOnRole /></Layout>} />
              
              {/* Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <RequireAuth allowedRoles={['student']}>
                    <Layout>
                      <StudentDashboard />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/student/grades" 
                element={
                  <RequireAuth allowedRoles={['student']}>
                    <Layout>
                      <GradesPage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/student/resit-exams" 
                element={
                  <RequireAuth allowedRoles={['student']}>
                    <Layout>
                      <ResitExamsPage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/student/notifications" 
                element={
                  <RequireAuth allowedRoles={['student']}>
                    <Layout>
                      <NotificationsPage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              
              {/* Instructor Routes */}
              <Route 
                path="/instructor/dashboard" 
                element={
                  <RequireAuth allowedRoles={['instructor']}>
                    <Layout>
                      <InstructorDashboard />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/instructor/upload-grades" 
                element={
                  <RequireAuth allowedRoles={['instructor']}>
                    <Layout>
                      <UploadGradesPage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/instructor/resit-details" 
                element={
                  <RequireAuth allowedRoles={['instructor']}>
                    <Layout>
                      <ResitDetailsPage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/instructor/notifications" 
                element={
                  <RequireAuth allowedRoles={['instructor']}>
                    <Layout>
                      <InstructorNotificationsPage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              
              {/* Faculty Secretary Routes */}
              <Route 
                path="/faculty/dashboard" 
                element={
                  <RequireAuth allowedRoles={['faculty_secretary']}>
                    <Layout>
                      <FacultyDashboard />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/faculty/upload-schedule" 
                element={
                  <RequireAuth allowedRoles={['faculty_secretary']}>
                    <Layout>
                      <UploadSchedulePage />
                    </Layout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/faculty/update-resit" 
                element={
                  <RequireAuth allowedRoles={['faculty_secretary']}>
                    <Layout>
                      <UpdateResitPage />
                    </Layout>
                  </RequireAuth>
                } 
              />

              {/* Catch All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// This component redirects users to their appropriate dashboard based on role
const RedirectBasedOnRole = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
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

export default App;
