
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, CalendarClock } from "lucide-react";

interface DashboardData {
  role: string;
  // Student dashboard data
  total_courses?: number;
  registered_resits?: number;
  gpa?: string | null;
  // Instructor dashboard data
  courses?: Array<{
    course_id: number;
    course_code: string;
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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
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

    fetchDashboardData();
  }, []);

  const renderStudentDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Student Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total_courses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Resits</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.registered_resits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPA</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.gpa ?? "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderInstructorDashboard = () => {
    if (!dashboardData || !dashboardData.courses) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Instructor Dashboard</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.courses.map((course) => (
              <Card key={course.course_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.course_code}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Total Students: {course.total_students}</p>
                  <p className="text-sm text-muted-foreground">
                    Resit Students: {
                      dashboardData.resitStats?.find(stat => stat.course_code === course.course_code)?.resit_students || 0
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFacultySecretaryDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Faculty Secretary Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resit Registrations</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total_resit_registrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resit Exams</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total_resit_exams}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">Unable to load dashboard data.</p>
        </div>
      );
    }

    switch (user?.role) {
      case "student":
        return renderStudentDashboard();
      case "instructor":
        return renderInstructorDashboard();
      case "faculty_secretary":
        return renderFacultySecretaryDashboard();
      default:
        return (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">Unknown user role.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to GradeSync</h1>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
