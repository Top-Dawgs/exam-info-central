
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, facultyAPI } from "@/services";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import FacultyDashboard from "@/components/dashboard/FacultyDashboard";
import LoadingDashboard from "@/components/dashboard/LoadingDashboard";

interface DashboardData {
  role: string;
  // Student dashboard data
  total_courses?: number;
  registered_resits?: number;
  gpa?: string | null;
  courses?: Array<{ course_id: number; course_code: string; course_name: string }>;
  // Instructor dashboard data
  instructor_courses?: Array<{
    course_id: number;
    course_code: string;
    course_name: string;
    total_students: number;
  }>;
  resitStats?: Array<{
    course_code: string;
    resit_students: number;
  }>;
  // Faculty secretary dashboard data
  total_resit_registrations?: number;
  total_resit_exams?: number;
}

interface ResitExam {
  course_id: number;
  course_code: string;
  course_name: string;
  instructor_name: string;
  exam_date: string;
}

interface ResitRegistration {
  course_id: number;
  course_code: string;
  course_name: string;
  student_count: number;
  students?: Array<{
    student_id: number;
    student_name: string;
  }>;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [resitRegistrations, setResitRegistrations] = useState<ResitRegistration[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardAPI.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // For faculty secretary, fetch additional data
    const fetchFacultyData = async () => {
      if (user?.role === "faculty_secretary") {
        try {
          const examsData = await facultyAPI.getAllResitExams();
          setResitExams(examsData.resitExams || []);
          
          const registrationsData = await facultyAPI.getAllResitRegistrations();
          setResitRegistrations(registrationsData.registrations || []);
        } catch (error) {
          console.error("Error fetching faculty data:", error);
        }
      }
    };

    fetchDashboardData();
    if (user?.role === "faculty_secretary") {
      fetchFacultyData();
    }
  }, [user?.role]);

  const renderDashboard = () => {
    if (loading) {
      return <LoadingDashboard />;
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-lg text-gray-500 dark:text-gray-400">Unable to load dashboard data.</p>
        </div>
      );
    }

    switch (user?.role) {
      case "student":
        return <StudentDashboard dashboardData={dashboardData} />;
      case "instructor":
        return <InstructorDashboard dashboardData={dashboardData} />;
      case "faculty_secretary":
        return (
          <FacultyDashboard 
            dashboardData={dashboardData} 
            resitExams={resitExams} 
            resitRegistrations={resitRegistrations} 
          />
        );
      default:
        return (
          <div className="text-center py-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <p className="text-lg text-gray-500 dark:text-gray-400">Unknown user role.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-white dark:from-gray-900/50 dark:via-gray-900 dark:to-gray-900"></div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
