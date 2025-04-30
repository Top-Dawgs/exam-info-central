
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

// Student pages
import StudentGrades from "./pages/student/StudentGrades";
import StudentResitExams from "./pages/student/StudentResitExams";
import StudentNotifications from "./pages/student/StudentNotifications";

// Instructor pages
import InstructorUploadGrades from "./pages/instructor/InstructorUploadGrades";
import InstructorResitExams from "./pages/instructor/InstructorResitExams";
import InstructorNotifications from "./pages/instructor/InstructorNotifications";

// Faculty secretary pages
import FacultyUploadSchedule from "./pages/faculty/FacultyUploadSchedule";
import FacultyManageResits from "./pages/faculty/FacultyManageResits";
import FacultyNotifications from "./pages/faculty/FacultyNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* Protected routes for all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="student/grades" element={<StudentGrades />} />
              <Route path="student/resit-exams" element={<StudentResitExams />} />
              <Route path="student/notifications" element={<StudentNotifications />} />
            </Route>

            {/* Instructor routes */}
            <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
              <Route path="instructor/upload-grades" element={<InstructorUploadGrades />} />
              <Route path="instructor/resit-exams" element={<InstructorResitExams />} />
              <Route path="instructor/notifications" element={<InstructorNotifications />} />
            </Route>

            {/* Faculty secretary routes */}
            <Route element={<ProtectedRoute allowedRoles={["faculty_secretary"]} />}>
              <Route path="faculty/upload-schedule" element={<FacultyUploadSchedule />} />
              <Route path="faculty/manage-resits" element={<FacultyManageResits />} />
              <Route path="faculty/notifications" element={<FacultyNotifications />} />
            </Route>
          </Route>

          {/* Catch-all route - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
