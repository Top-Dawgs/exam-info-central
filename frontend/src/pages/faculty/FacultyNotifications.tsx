
import { useState, useEffect } from "react";
import { facultyAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, Download, Users } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingDashboard from "@/components/dashboard/LoadingDashboard";

interface Student {
  user_id: number;
  email: string;
  name?: string;
}

interface ResitCourse {
  course_id: number;
  course_code: string;
  course_name: string;
}

const FacultyNotifications = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  
  const [courses, setCourses] = useState<ResitCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseMessage, setCourseMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const data = await facultyAPI.getResitRegisteredStudents();
        setStudents(data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Could not fetch students.");
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const data = await facultyAPI.getResitCourses();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Could not fetch courses.");
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchStudents();
    fetchCourses();
  }, []);

  const handleSubmitToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudentId || !message) {
      toast.error("Student and message are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await facultyAPI.sendNotification(null, message, parseInt(selectedStudentId));
      
      if (result.success) {
        toast.success("Notification sent successfully");
        // Clear the form
        setSelectedStudentId("");
        setMessage("");
      } else {
        toast.error(result.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId || !courseMessage) {
      toast.error("Course and message are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await facultyAPI.sendNotification(selectedCourseId, courseMessage);
      
      if (result.success) {
        toast.success("Notification sent to all course participants");
        // Clear the form
        setCourseMessage("");
      } else {
        toast.error(result.message || "Failed to send notification to course");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification to course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    
    setIsExporting(true);
    
    try {
      const result = await facultyAPI.exportResit(selectedCourseId);
      if (result.success) {
        toast.success("Export started. Check your downloads folder.");
      } else {
        toast.error(result.message || "Failed to export resit participants list");
      }
    } catch (error) {
      console.error("Error exporting resit list:", error);
      toast.error("Failed to export resit participants list");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingStudents && isLoadingCourses) {
    return <LoadingDashboard />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Send Notifications</h1>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="individual">To Individual</TabsTrigger>
          <TabsTrigger value="course">To Course</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card className="card-hover transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
              <CardTitle className="flex items-center text-xl font-bold">
                <Bell className="h-5 w-5 mr-3 text-primary" />
                Send Notification to Student
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitToUser} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="selectedStudentId">Select Student</Label>
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger className="w-full bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStudents ? (
                        <SelectItem value="loading" disabled>Loading students...</SelectItem>
                      ) : students.length > 0 ? (
                        students.map((student) => (
                          <SelectItem key={student.user_id} value={student.user_id.toString()}>
                            {student.name || student.email}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No students found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your notification message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 min-h-[100px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isSubmitting || !selectedStudentId || !message}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="course">
          <Card className="card-hover transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
              <CardTitle className="flex items-center text-xl font-bold">
                <Users className="h-5 w-5 mr-3 text-primary" />
                Send Notification to Course
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitToCourse} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="course">Select Course</Label>
                  <Select
                    value={selectedCourseId?.toString() || ""}
                    onValueChange={(value) => setSelectedCourseId(parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50">
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCourses ? (
                        <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                      ) : courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem key={course.course_id} value={course.course_id.toString()}>
                            {course.course_name} ({course.course_code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No courses available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseMessage">Message</Label>
                  <Textarea
                    id="courseMessage"
                    placeholder="Enter your notification message for all course participants"
                    value={courseMessage}
                    onChange={(e) => setCourseMessage(e.target.value)}
                    required
                    rows={4}
                    className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isSubmitting || !selectedCourseId || !courseMessage}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        Send to All
                      </div>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleExport}
                    variant="secondary"
                    disabled={isExporting || !selectedCourseId}
                    className="w-full hover:bg-gray-100"
                  >
                    {isExporting ? (
                      <div className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        Exporting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyNotifications;
