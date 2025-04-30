import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

const UploadGradesPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !course || !semester) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields and select a file.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', course);
    formData.append('semester', semester);
    
    try {
      await API.post('/api/instructor/upload-grades-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Success',
        description: 'Grades have been uploaded successfully.',
      });
      
      // Reset form
      setFile(null);
      setCourse('');
      setSemester('');
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading grades:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading the grades. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Dummy courses for the select dropdown
  // In a real app, these would be fetched from the backend
  const courses = [
    { id: 'CS101', name: 'Introduction to Computer Science' },
    { id: 'CS201', name: 'Data Structures' },
    { id: 'CS301', name: 'Database Systems' },
    { id: 'CS401', name: 'Artificial Intelligence' },
  ];
  
  // Dummy semesters for the select dropdown
  const semesters = [
    'Fall 2024',
    'Spring 2025',
    'Summer 2025',
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Grades</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Grade File</CardTitle>
          <CardDescription>
            Upload an Excel or CSV file containing student grades for a specific course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={course} onValueChange={setCourse}>
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
              <Label htmlFor="semester-select">Select Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <Input 
                id="file-upload" 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileChange} 
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Supported formats: CSV, XLSX, XLS
              </p>
            </div>
            
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? 'Uploading...' : 'Upload Grades'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>File Format Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your grade file should be formatted with the following columns:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Column</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">student_id</td>
                  <td className="border border-gray-300 px-4 py-2">Student ID number</td>
                  <td className="border border-gray-300 px-4 py-2">123456</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">name</td>
                  <td className="border border-gray-300 px-4 py-2">Student full name</td>
                  <td className="border border-gray-300 px-4 py-2">John Doe</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">grade</td>
                  <td className="border border-gray-300 px-4 py-2">Numeric grade (0-100)</td>
                  <td className="border border-gray-300 px-4 py-2">85</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadGradesPage;
