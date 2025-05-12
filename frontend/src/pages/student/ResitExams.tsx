import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';
import CourseSelect from "@/components/CourseSelect";


interface ResitExam {
  id: string;
  course_id: string;
  course_name: string;
  date: string;
  time: string;
  location: string;
  is_declared: boolean;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
}

const ResitExamsPage: React.FC = () => {
  const { toast } = useToast();

  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [declaring, setDeclaring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resitsRes, eligibleRes] = await Promise.all([
          API.get('/api/student/my-resit-exams'),
          API.get('/api/student/eligible-resit-courses'),
        ]);

        console.log('✅ Resit Exams:', resitsRes.data);
        console.log('✅ Eligible Courses:', eligibleRes.data);

        setResitExams(resitsRes.data || []);
        setEligibleCourses(eligibleRes.data.eligible_courses || []);
      } catch (err) {
        const error = err as AxiosError;
        console.error('❌ Error loading resit data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resit data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDeclareResit = async () => {
    if (!selectedCourseId) return;

    setDeclaring(true);
    try {
      await API.post('/api/declare-resit', { course_id: Number(selectedCourseId) });

      toast({ title: 'Success', description: 'You have successfully declared for the resit.' });

      const declared = eligibleCourses.find(c => c.course_id.toString() === selectedCourseId);
      if (declared) {
        setResitExams(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            course_id: declared.course_id.toString(),
            course_name: declared.course_name,
            date: 'TBD',
            time: 'TBD',
            location: 'TBD',
            is_declared: true,
          }
        ]);
      }

      setEligibleCourses(prev =>
        prev.filter(c => c.course_id.toString() !== selectedCourseId)
      );
      setSelectedCourseId('');
    } catch (err) {
      const error = err as AxiosError;
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to declare.',
        variant: 'destructive',
      });
      console.error('❌ Declaration error:', error);
    } finally {
      setDeclaring(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Resit Exams</h1>

      {/* Register for Resit Section */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Register for Resit Exam</h2>

        {/* Debug log */}
        {console.log('📌 Rendering Dropdown - Eligible Courses:', eligibleCourses)}

        {eligibleCourses && eligibleCourses.length > 0 ? (
          <div className="space-y-4">
            <CourseSelect
              courses={eligibleCourses}
                onChange={(id: number) => setSelectedCourseId(id.toString())}
               placeholder="Choose a course for resit"
              label="Select Course"
            />


    <Button
      disabled={!selectedCourseId || declaring}
      onClick={handleDeclareResit}
      className="w-full"
    >
      {declaring ? 'Declaring...' : 'Declare for Selected Course'}
    </Button>
  </div>
) : (
  <>
    <p className="text-sm text-red-500 font-medium">
      No eligible courses found (UI fallback). You may be eligible, but rendering failed.
    </p>
    <pre className="text-xs bg-gray-100 p-2 rounded border mt-2 max-h-40 overflow-y-auto">
      {JSON.stringify(eligibleCourses, null, 2)}
    </pre>
  </>
)}


        <ul className="text-sm text-gray-600 list-disc pl-5">
          <li>Register for each resit exam separately</li>
          <li>Registration closes 48 hours before the exam</li>
          <li>Check eligibility criteria before registering</li>
        </ul>
      </div>

      {/* Registered Resit Exams */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Registered Resit Exams</h2>
        {resitExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resitExams.map(exam => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{exam.course_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Date:</strong> {exam.date !== 'TBD' ? formatDate(exam.date) : 'TBD'}</div>
                  <div><strong>Time:</strong> {exam.time || 'TBD'}</div>
                  <div><strong>Location:</strong> {exam.location || 'TBD'}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className={`${exam.is_declared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded-full text-xs`}>
                      {exam.is_declared ? 'Declared' : 'Not Declared'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled className="w-full">
                    {exam.is_declared ? 'Already Declared' : 'Declare'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No resit exams available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResitExamsPage;
