
import { useState } from "react";
import { instructorAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const InstructorUploadGrades = () => {
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!courseId) {
      toast.error("Please enter a course ID");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await instructorAPI.uploadGradesFile(file, parseInt(courseId));
      toast.success("Grades uploaded successfully");
      
      // Clear the form
      setFile(null);
      setCourseId("");
      
      // Display upload statistics
      if (response.processed) {
        toast.info(`Processed ${response.processed} grade entries`);
      }
      
      if (response.errors && response.errors.length > 0) {
        toast.error(`Encountered ${response.errors.length} errors during upload`);
      }
    } catch (error) {
      console.error("Error uploading grades:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Grades</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Grades File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Course ID</Label>
              <Input
                id="courseId"
                type="number"
                placeholder="Enter course ID"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Grades CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-gray-500">
                Upload a CSV file with columns: student_id (or email), grade
              </p>
            </div>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Grades
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">CSV Format Guidelines</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <p className="mb-2">Your CSV file should include these columns:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>student_id</strong> or <strong>email</strong> - Student ID or email address
                </li>
                <li>
                  <strong>grade</strong> - Numeric grade (0-100) or "DZ" for non-attendance
                </li>
              </ul>
              <p className="mt-2">
                Example: <code>email,grade</code>
                <br />
                <code>student1@example.com,85</code>
                <br />
                <code>student2@example.com,DZ</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorUploadGrades;
