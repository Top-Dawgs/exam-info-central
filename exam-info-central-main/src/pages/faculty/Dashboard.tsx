
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  total_resit_registrations: number;
  total_resit_exams: number;
}

const FacultyDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await API.get('/api/dashboard');
        
        // Direct mapping from backend response
        setDashboardData(response.data);
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
      <h1 className="text-3xl font-bold">Faculty Secretary Dashboard</h1>
      
      {dashboardData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Resit Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboardData.total_resit_registrations}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Resit Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboardData.total_resit_exams}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">No recent activity available.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FacultyDashboard;
