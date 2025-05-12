
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

interface Course {
  course_id: string;
  course_code: string;
  total_students: number;
}

interface ResitStat {
  course_code: string;
  resit_students: number;
}

interface DashboardData {
  courses: Course[];
  resitStats: ResitStat[];
}

const InstructorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await API.get('/api/dashboard');
        
        // Map directly from the backend response - structure already matches
        setDashboardData({
          courses: response.data.courses || [],
          resitStats: response.data.resitStats || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
      
      {dashboardData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboardData.courses?.length || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {dashboardData.courses?.reduce((total, course) => total + course.total_students, 0) || 0}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.courses && dashboardData.courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course Code</th>
                        <th className="text-right py-3 px-4">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.courses.map((course) => (
                        <tr key={course.course_id} className="border-b">
                          <td className="py-3 px-4">{course.course_code}</td>
                          <td className="text-right py-3 px-4">{course.total_students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No course information available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resit Information</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.resitStats && dashboardData.resitStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course Code</th>
                        <th className="text-right py-3 px-4">Resit Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.resitStats.map((stat, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{stat.course_code}</td>
                          <td className="text-right py-3 px-4">{stat.resit_students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No resit information available.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;
