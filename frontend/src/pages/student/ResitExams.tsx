import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

interface ResitExam {
  id: string;
  course_id: string;
  course_name: string;
  date: string;
  time: string;
  location: string;
  is_declared: boolean;
}

const ResitExamsPage: React.FC = () => {
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [declaringId, setDeclaringId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResitExams = async () => {
      try {
        const response = await API.get('/api/student/my-resit-exams');
        setResitExams(response.data);
      } catch (error) {
        console.error('Error fetching resit exams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resit exams data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResitExams();
  }, [toast]);

  const handleDeclareResit = async (resitId: string) => {
    setDeclaringId(resitId);
    try {
      await API.post('/api/declare-resit', { resit_id: resitId });
      
      // Update the local state to reflect the declaration
      setResitExams(resitExams.map(exam => 
        exam.id === resitId ? { ...exam, is_declared: true } : exam
      ));
      
      toast({
        title: 'Success',
        description: 'You have successfully declared for this resit exam.',
      });
    } catch (error) {
      console.error('Error declaring for resit:', error);
      toast({
        title: 'Error',
        description: 'Failed to declare for resit exam',
        variant: 'destructive',
      });
    } finally {
      setDeclaringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resit Exams</h1>
      
      {resitExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resitExams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle>{exam.course_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Date:</span> {formatDate(exam.date)}
                </div>
                <div>
                  <span className="font-medium">Time:</span> {exam.time}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {exam.location}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exam.is_declared 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {exam.is_declared ? 'Declared' : 'Not Declared'}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleDeclareResit(exam.id)}
                  disabled={exam.is_declared || declaringId === exam.id}
                  className="w-full"
                >
                  {declaringId === exam.id 
                    ? 'Processing...' 
                    : exam.is_declared 
                      ? 'Already Declared' 
                      : 'Declare for Resit'}
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
  );
};

export default ResitExamsPage;
