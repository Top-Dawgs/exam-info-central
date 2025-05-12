
import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, BookOpen, CalendarClock, Layers, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StatCard from "./StatCard";

interface StudentDashboardProps {
  dashboardData: {
    total_courses?: number;
    registered_resits?: number;
    gpa?: string | null;
    courses?: Array<{ course_id: number; course_code: string; course_name: string }>;
  };
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ dashboardData }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl mb-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        <h2 className="text-3xl font-bold flex items-center">
          <GraduationCap className="mr-3 h-8 w-8" />
          Student Dashboard
        </h2>
        <p className="mt-2 text-blue-100">Manage your courses, grades and exams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Courses" 
          value={dashboardData.total_courses || 0}
          icon={<BookOpen className="h-5 w-5 text-blue-600" />} 
          index={0}
          onClick={() => navigate("/student/grades")}
        />
        <StatCard 
          title="Registered Resits" 
          value={dashboardData.registered_resits || 0}
          icon={<CalendarClock className="h-5 w-5 text-green-600" />} 
          index={1}
          onClick={() => navigate("/student/resit-exams")}
        />
        <StatCard 
          title="GPA" 
          value={dashboardData.gpa ?? "N/A"}
          icon={<Award className="h-5 w-5 text-yellow-600" />} 
          index={2}
          onClick={() => navigate("/student/grades")}
        />
      </div>

      {dashboardData.courses && dashboardData.courses.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Layers className="mr-2 h-5 w-5 text-indigo-500" />
            My Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.courses.map((course, index) => (
              <Card key={course.course_id} className="hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">{course.course_code}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{course.course_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
