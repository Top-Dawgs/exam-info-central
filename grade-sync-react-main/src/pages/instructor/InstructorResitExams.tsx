
import { useState } from "react";
import { instructorAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Download, Plus } from "lucide-react";
import { toast } from "sonner";

const InstructorResitExams = () => {
  const [resitFormData, setResitFormData] = useState({
    course_id: "",
    exam_date: "",
    no_of_questions: "",
    allowed_tools: "",
    notes: "",
  });
  const [isSubmittingResit, setIsSubmittingResit] = useState(false);
  
  const [exportCourseId, setExportCourseId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

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
    
    if (!resitFormData.course_id || !resitFormData.exam_date) {
      toast.error("Course ID and exam date are required");
      return;
    }
    
    setIsSubmittingResit(true);
    
    try {
      await instructorAPI.addResitDetails({
        course_id: parseInt(resitFormData.course_id),
        exam_date: resitFormData.exam_date,
        no_of_questions: resitFormData.no_of_questions ? parseInt(resitFormData.no_of_questions) : undefined,
        allowed_tools: resitFormData.allowed_tools || undefined,
        notes: resitFormData.notes || undefined,
      });
      
      toast.success("Resit exam details submitted successfully");
      
      // Clear the form
      setResitFormData({
        course_id: "",
        exam_date: "",
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
      toast.error("Please enter a course ID");
      return;
    }
    
    setIsExporting(true);
    
    try {
      await instructorAPI.exportResit(parseInt(exportCourseId));
      toast.success("Export started. Check your downloads folder.");
    } catch (error) {
      console.error("Error exporting resit list:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resit Exams</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Resit Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResitSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course_id">Course ID *</Label>
                <Input
                  id="course_id"
                  name="course_id"
                  type="number"
                  placeholder="Enter course ID"
                  value={resitFormData.course_id}
                  onChange={handleResitInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam_date">Exam Date *</Label>
                <Input
                  id="exam_date"
                  name="exam_date"
                  type="date"
                  value={resitFormData.exam_date}
                  onChange={handleResitInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_of_questions">Number of Questions</Label>
                <Input
                  id="no_of_questions"
                  name="no_of_questions"
                  type="number"
                  placeholder="Enter number of questions"
                  value={resitFormData.no_of_questions}
                  onChange={handleResitInputChange}
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmittingResit}>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Resit Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExportSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exportCourseId">Course ID</Label>
                <Input
                  id="exportCourseId"
                  type="number"
                  placeholder="Enter course ID"
                  value={exportCourseId}
                  onChange={(e) => setExportCourseId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isExporting}>
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
