import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

const NotificationsPage: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('all');
  const [courseId, setCourseId] = useState<string>('');
  const [sending, setSending] = useState(false);
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
    
    if (!title || !message || !targetType) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (targetType === 'course' && !courseId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a course.',
        variant: 'destructive',
      });
      return;
    }
    
    setSending(true);
    
    try {
      await API.post('/api/instructor/notify', {
        title,
        message,
        target_type: targetType,
        course_id: targetType === 'course' ? courseId : null,
      });
      
      toast({
        title: 'Success',
        description: 'Notification has been sent successfully.',
      });
      
      // Reset form
      setTitle('');
      setMessage('');
      setTargetType('all');
      setCourseId('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Sending Failed',
        description: 'An error occurred while sending the notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Send Notifications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>
            Send notifications to students about important updates or information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Exam Schedule Change"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Notification Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter detailed notification message..."
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-type">Send To</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All my students</SelectItem>
                  <SelectItem value="course">Specific course</SelectItem>
                  <SelectItem value="resit">Students with pending resits</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {targetType === 'course' && (
              <div className="space-y-2">
                <Label htmlFor="course-select">Select Course</Label>
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
            )}
            
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
