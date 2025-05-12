
import { useState, useEffect } from "react";
import { instructorAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import CourseSelect, { Course } from "@/components/CourseSelect";

const InstructorResitExams = () => {
  const [resitFormData, setResitFormData] = useState({
    no_of_questions: "",
    allowed_tools: "",
    notes: "",
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [exportCourseId, setExportCourseId] = useState<number | null>(null);
  
  const [isSubmittingResit, setIsSubmittingResit] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await instructorAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleResitInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setResitFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId) {
      toast.error("Course is required");
      return;
    }
    
    setIsSubmittingResit(true);
    
    try {
      await instructorAPI.addResitDetails({
        course_id: selectedCourseId,
        no_of_questions: resitFormData.no_of_questions ? parseInt(resitFormData.no_of_questions) : undefined,
        allowed_tools: resitFormData.allowed_tools || undefined,
        notes: resitFormData.notes || undefined,
      });
      
      toast.success("Resit exam details submitted successfully");
      
      // Clear the form
      setResitFormData({
        no_of_questions: "",
        allowed_tools: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting resit details:", error);
    } finally {
      setIsSubmittingResit(false);
    }
  };

  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exportCourseId) {
      toast.error("Please select a course");
      return;
    }
    
    setIsExporting(true);
    
    try {
      await instructorAPI.exportResit(exportCourseId);
      toast.success("Export started. Check your downloads folder.");
    } catch (error) {
      console.error("Error exporting resit list:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Resit Exams</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
            <CardTitle className="flex items-center text-xl font-bold">
              <Plus className="h-5 w-5 mr-3 text-primary" />
              Add Resit Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleResitSubmit} className="space-y-5">
              <CourseSelect 
                courses={courses}
                onChange={(id) => setSelectedCourseId(id)}
                isLoading={isLoading}
                label="Course"
                placeholder="Select a course"
              />
              
              <div className="space-y-2">
                <Label htmlFor="no_of_questions">Number of Questions</Label>
                <Input
                  id="no_of_questions"
                  name="no_of_questions"
                  type="number"
                  placeholder="Enter number of questions"
                  value={resitFormData.no_of_questions}
                  onChange={handleResitInputChange}
                  className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowed_tools">Allowed Tools</Label>
                <Input
                  id="allowed_tools"
                  name="allowed_tools"
                  placeholder="Calculator, ruler, etc."
                  value={resitFormData.allowed_tools}
                  onChange={handleResitInputChange}
                  className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional instructions or notes"
                  value={resitFormData.notes}
                  onChange={handleResitInputChange}
                  className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 min-h-[100px]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={isSubmittingResit || !selectedCourseId}
              >
                {isSubmittingResit ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Submit Resit Details
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
            <CardTitle className="flex items-center text-xl font-bold">
              <Download className="h-5 w-5 mr-3 text-primary" />
              Export Resit Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleExportSubmit} className="space-y-5">
              <CourseSelect 
                courses={courses}
                onChange={(id) => setExportCourseId(id)}
                isLoading={isLoading}
                label="Course"
                placeholder="Select a course"
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={isExporting || !exportCourseId}
              >
                {isExporting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Exporting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Participant List
                  </div>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                This will download a CSV file with all students registered for the resit exam.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorResitExams;
