import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

const UploadSchedulePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
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
    
    if (!file || !semester) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file and semester.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);
    
    try {
      await API.post('/api/faculty/upload-schedule', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Success',
        description: 'Resit exam schedule has been uploaded successfully.',
      });
      
      // Reset form
      setFile(null);
      setSemester('');
      
      // Reset file input
      const fileInput = document.getElementById('schedule-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading schedule:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading the schedule. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Dummy semesters for the select dropdown
  const semesters = [
    'Fall 2024',
    'Spring 2025',
    'Summer 2025',
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Resit Exam Schedule</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Schedule File</CardTitle>
          <CardDescription>
            Upload an Excel or CSV file containing the resit examination schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="schedule-file">Upload Schedule File</Label>
              <Input 
                id="schedule-file" 
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
              {uploading ? 'Uploading...' : 'Upload Schedule'}
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
            Your schedule file should be formatted with the following columns:
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
                  <td className="border border-gray-300 px-4 py-2">course_id</td>
                  <td className="border border-gray-300 px-4 py-2">Course ID</td>
                  <td className="border border-gray-300 px-4 py-2">CS101</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">course_name</td>
                  <td className="border border-gray-300 px-4 py-2">Course name</td>
                  <td className="border border-gray-300 px-4 py-2">Introduction to Computer Science</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">date</td>
                  <td className="border border-gray-300 px-4 py-2">Exam date (YYYY-MM-DD)</td>
                  <td className="border border-gray-300 px-4 py-2">2025-01-15</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">time</td>
                  <td className="border border-gray-300 px-4 py-2">Exam time</td>
                  <td className="border border-gray-300 px-4 py-2">09:00</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">location</td>
                  <td className="border border-gray-300 px-4 py-2">Exam location</td>
                  <td className="border border-gray-300 px-4 py-2">Main Hall B101</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSchedulePage;
