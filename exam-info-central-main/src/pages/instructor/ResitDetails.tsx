import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

const ResitDetailsPage: React.FC = () => {
  const [courseId, setCourseId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Dummy courses for the select dropdown
  const courses = [
    { id: 'CS101', name: 'Introduction to Computer Science' },
    { id: 'CS201', name: 'Data Structures' },
    { id: 'CS301', name: 'Database Systems' },
    { id: 'CS401', name: 'Artificial Intelligence' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId || !date || !time || !location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await API.post('/api/instructor/resit-details', {
        course_id: courseId,
        date,
        time,
        location,
      });
      
      toast({
        title: 'Success',
        description: 'Resit exam details have been added successfully.',
      });
      
      // Reset form
      setCourseId('');
      setDate('');
      setTime('');
      setLocation('');
    } catch (error) {
      console.error('Error adding resit details:', error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred while adding the resit details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Resit Exam Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Resit Exam Information</CardTitle>
          <CardDescription>
            Add details for an upcoming resit examination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-select">Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                placeholder="Building and Room Number"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Add Resit Details'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>View Resit Participants</CardTitle>
          <CardDescription>
            Select a course to download the list of students registered for resit exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-course">Select Course</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="w-full">
              Export Participant List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResitDetailsPage;
