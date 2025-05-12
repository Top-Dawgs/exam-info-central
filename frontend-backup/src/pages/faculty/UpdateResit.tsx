import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

interface ResitExam {
  id: string;
  course_id: string;
  course_name: string;
  date: string;
  time: string;
  location: string;
}

const UpdateResitPage: React.FC = () => {
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResitExams = async () => {
      try {
        // This would be a call to get all scheduled resit exams
        // For this example, we'll use dummy data
        const dummyData: ResitExam[] = [
          {
            id: '1',
            course_id: 'CS101',
            course_name: 'Introduction to Computer Science',
            date: '2025-01-15',
            time: '09:00',
            location: 'Main Hall B101',
          },
          {
            id: '2',
            course_id: 'CS201',
            course_name: 'Data Structures',
            date: '2025-01-17',
            time: '14:00',
            location: 'Room A201',
          },
          {
            id: '3',
            course_id: 'CS301',
            course_name: 'Database Systems',
            date: '2025-01-20',
            time: '10:30',
            location: 'Computer Lab C103',
          },
        ];
        
        setResitExams(dummyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resit exams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resit exams data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchResitExams();
  }, [toast]);

  const handleSelectExam = (examId: string) => {
    const exam = resitExams.find(e => e.id === examId);
    if (exam) {
      setSelectedExam(examId);
      setDate(exam.date);
      setTime(exam.time);
      setLocation(exam.location);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExam || !date || !time || !location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setUpdating(true);
    
    try {
      await API.patch('/api/faculty/update-resit-info', {
        resit_id: selectedExam,
        date,
        time,
        location,
      });
      
      // Update the local state to reflect the changes
      setResitExams(resitExams.map(exam => 
        exam.id === selectedExam 
          ? { ...exam, date, time, location } 
          : exam
      ));
      
      toast({
        title: 'Success',
        description: 'Resit exam details have been updated successfully.',
      });
      
      // Reset form
      setSelectedExam('');
      setDate('');
      setTime('');
      setLocation('');
    } catch (error) {
      console.error('Error updating resit details:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating the resit details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Update Resit Exam Information</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Resit Details</CardTitle>
          <CardDescription>
            Change the date, time, or location for scheduled resit exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exam-select">Select Resit Exam</Label>
              <Select value={selectedExam} onValueChange={handleSelectExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam to update" />
                </SelectTrigger>
                <SelectContent>
                  {resitExams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.course_name} ({exam.course_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedExam && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Building and Room Number"
                  />
                </div>
                
                <Button type="submit" disabled={updating} className="w-full">
                  {updating ? 'Updating...' : 'Update Resit Details'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Resit Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Course</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Location</th>
                </tr>
              </thead>
              <tbody>
                {resitExams.map((exam) => (
                  <tr key={exam.id} className="border-b">
                    <td className="py-3 px-4">
                      {exam.course_name} ({exam.course_id})
                    </td>
                    <td className="py-3 px-4">{exam.date}</td>
                    <td className="py-3 px-4">{exam.time}</td>
                    <td className="py-3 px-4">{exam.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateResitPage;
