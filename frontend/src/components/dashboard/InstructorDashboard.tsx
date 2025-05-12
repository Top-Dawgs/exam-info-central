
import React from "react";
import { Users, Layers, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InstructorDashboardProps {
  dashboardData: {
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
  };
}

const getGradientClass = (index: number) => {
  const gradients = [
    "from-blue-500 to-purple-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-500",
    "from-teal-500 to-cyan-500"
  ];
  return gradients[index % gradients.length];
};

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ dashboardData }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl mb-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        <h2 className="text-3xl font-bold flex items-center">
          <Users className="mr-3 h-8 w-8" />
          Instructor Dashboard
        </h2>
        <p className="mt-2 text-indigo-100">Manage your courses and student grades</p>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Layers className="mr-2 h-5 w-5 text-indigo-500" />
          Your Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardData.instructor_courses && dashboardData.instructor_courses.length > 0 ? (
            dashboardData.instructor_courses.map((course, index) => (
              <Card key={course.course_id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-10 rounded-xl`}></div>
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {course.course_code}
                    <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 py-1 px-2 rounded-full">
                      {course.total_students} Students
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{course.course_name}</p>
                  <p className="text-sm flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1 text-amber-500" />
                    Resit Students: {
                      dashboardData.resitStats?.find(stat => stat.course_code === course.course_code)?.resit_students || 0
                    }
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-lg text-gray-500 dark:text-gray-400">No courses assigned yet.</p>
              <p className="text-sm text-gray-400">You'll see your courses here once they're assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
