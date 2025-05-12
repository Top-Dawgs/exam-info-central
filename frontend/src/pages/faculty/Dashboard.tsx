import React, { useState, useEffect } from 'react';
import API from '@/api/axios';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import { useToast } from '@/hooks/use-toast';

const FacultyDashboardPage: React.FC = () => {
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<any>({});
  const [resitExams, setResitExams] = useState([]);
  const [resitRegistrations, setResitRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashboardRes, examsRes, registrationsRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/faculty/all-resit-exams'),
          API.get('/faculty/all-resit-registrations'),
        ]);

        // Normalize backend response field for frontend
        const mappedRegistrations = registrationsRes.data.registrations.map((r: any) => ({
          ...r,
          student_count: r.total_registered,
          students: [], // if needed in future
        }));

        setDashboardData({
          total_resit_registrations: mappedRegistrations.reduce((sum, r) => sum + r.student_count, 0),
          total_resit_exams: examsRes.data.exams?.length || 0
        });
        
        setResitExams(examsRes.data.exams || []);
        setResitRegistrations(mappedRegistrations);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        toast({
          title: 'Dashboard Error',
          description: 'Could not load faculty data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FacultyDashboard
      dashboardData={dashboardData}
      resitExams={resitExams}
      resitRegistrations={resitRegistrations}
    />
  );
};

export default FacultyDashboardPage;
