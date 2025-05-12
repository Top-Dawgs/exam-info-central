
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

interface GradeData {
  id: string;
  course_id: string;
  course_name: string;
  semester: string;
  grade: number;
  passed: boolean;
}

const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await API.get('/api/student/my-grades');
        setGrades(response.data);
        
        // Extract unique semesters for the tabs and ensure string[] type
        const uniqueSemesters = [...new Set(response.data.map((grade: GradeData) => grade.semester))] as string[];
        setSemesters(uniqueSemesters);
      } catch (error) {
        console.error('Error fetching grades:', error);
        toast({
          title: 'Error',
          description: 'Failed to load grades data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
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
      <h1 className="text-3xl font-bold">My Grades</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Grade Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length > 0 ? (
            <Tabs defaultValue={semesters[0]} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[500px]">
                {semesters.map((semester) => (
                  <TabsTrigger key={semester} value={semester}>
                    {semester}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {semesters.map((semester) => (
                <TabsContent key={semester} value={semester}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Course</th>
                          <th className="text-center py-3 px-4">Grade</th>
                          <th className="text-right py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades
                          .filter((grade) => grade.semester === semester)
                          .map((grade) => (
                            <tr key={grade.id} className="border-b">
                              <td className="py-3 px-4">{grade.course_name}</td>
                              <td className="text-center py-3 px-4">{grade.grade}</td>
                              <td className="text-right py-3 px-4">
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    grade.passed 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {grade.passed ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className="text-center py-8 text-gray-500">No grades available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesPage;
