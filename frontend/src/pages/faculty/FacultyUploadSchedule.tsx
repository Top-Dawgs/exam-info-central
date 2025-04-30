
import { useState } from "react";
import { facultyAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const FacultyUploadSchedule = () => {
  const [file, setFile] = useState<File | null>(null);
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
    
    setIsUploading(true);
    
    try {
      const response = await facultyAPI.uploadSchedule(file);
      toast.success("Schedule uploaded successfully");
      
      // Clear the form
      setFile(null);
      
      if (response.filename) {
        toast.info(`File uploaded as: ${response.filename}`);
      }
    } catch (error) {
      console.error("Error uploading schedule:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Exam Schedule</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Schedule File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Schedule File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-gray-500">
                Upload the complete resit exam schedule (CSV, Excel, or PDF format)
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
                  Upload Schedule
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Schedule File Guidelines</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <p className="mb-2">Your schedule file should include:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Course code and name</li>
                <li>Exam date and time</li>
                <li>Location</li>
                <li>Duration</li>
                <li>Any special instructions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyUploadSchedule;
