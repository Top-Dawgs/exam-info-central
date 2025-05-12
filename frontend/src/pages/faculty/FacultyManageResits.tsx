
import { useState } from "react";
import { facultyAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Download } from "lucide-react";
import { toast } from "sonner";

const FacultyManageResits = () => {
  const [updateFormData, setUpdateFormData] = useState({
    course_id: "",
    exam_date: "",
    location: "",
  });
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  
  const [registrationCourseId, setRegistrationCourseId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateFormData.course_id) {
      toast.error("Course ID is required");
      return;
    }
    
    if (!updateFormData.exam_date && !updateFormData.location) {
      toast.error("Either exam date or location must be provided");
      return;
    }
    
    setIsSubmittingUpdate(true);
    
    try {
      await facultyAPI.updateResitInfo({
        course_id: parseInt(updateFormData.course_id),
        exam_date: updateFormData.exam_date || undefined,
        location: updateFormData.location || undefined,
      });
      
      toast.success("Resit exam information updated successfully");
      
      // Clear the form
      setUpdateFormData({
        course_id: "",
        exam_date: "",
        location: "",
      });
    } catch (error) {
      console.error("Error updating resit info:", error);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationCourseId) {
      toast.error("Please enter a course ID");
      return;
    }
    
    setIsExporting(true);
    
    try {
      const result = await facultyAPI.exportResit(parseInt(registrationCourseId));
      
      if (result.success) {
        toast.success("Export completed successfully. Check your downloads folder.");
      } else {
        toast.error(result.message || "Failed to export resit list");
      }
    } catch (error) {
      console.error("Error exporting resit registrations:", error);
      toast.error("Failed to export resit list");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Resit Exams</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="h-5 w-5 mr-2" />
              Update Resit Exam Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course_id">Course ID *</Label>
                <Input
                  id="course_id"
                  name="course_id"
                  type="number"
                  placeholder="Enter course ID"
                  value={updateFormData.course_id}
                  onChange={handleUpdateInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam_date">Exam Date</Label>
                <Input
                  id="exam_date"
                  name="exam_date"
                  type="date"
                  value={updateFormData.exam_date}
                  onChange={handleUpdateInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter exam location"
                  value={updateFormData.location}
                  onChange={handleUpdateInputChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmittingUpdate}>
                {isSubmittingUpdate ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Updating...
                  </div>
                ) : (
                  "Update Resit Information"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Resit Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registrationCourseId">Course ID</Label>
                <Input
                  id="registrationCourseId"
                  type="number"
                  placeholder="Enter course ID"
                  value={registrationCourseId}
                  onChange={(e) => setRegistrationCourseId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isExporting}>
                {isExporting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Downloading...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyManageResits;
