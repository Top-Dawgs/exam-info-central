
import { useState, useEffect } from "react";
import { instructorAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, Download, Users } from "lucide-react";
import { toast } from "sonner";
import CourseSelect, { Course } from "@/components/CourseSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InstructorNotifications = () => {
  const [targetUserId, setTargetUserId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseMessage, setCourseMessage] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await instructorAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSubmitToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetUserId || !message) {
      toast.error("User ID and message are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await instructorAPI.sendNotification(null, message, parseInt(targetUserId));
      toast.success("Notification sent successfully");
      
      // Clear the form
      setTargetUserId("");
      setMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
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
      await instructorAPI.sendNotification(selectedCourseId, courseMessage);
      toast.success("Notification sent to all course participants");
      
      // Clear the form
      setCourseMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
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
      await instructorAPI.exportResit(selectedCourseId);
      toast.success("Export started. Check your downloads folder.");
    } catch (error) {
      console.error("Error exporting resit list:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Send Notifications</h1>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="individual">To Individual</TabsTrigger>
          <TabsTrigger value="course">To Course</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card className="card-hover">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
              <CardTitle className="flex items-center text-xl font-bold">
                <Bell className="h-5 w-5 mr-3 text-primary" />
                Send Notification to Student
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitToUser} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="targetUserId">Student ID</Label>
                  <Input
                    id="targetUserId"
                    type="number"
                    placeholder="Enter student ID"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    required
                    className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50"
                  />
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
                  disabled={isSubmitting || !targetUserId || !message}
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
          <Card className="card-hover">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
              <CardTitle className="flex items-center text-xl font-bold">
                <Users className="h-5 w-5 mr-3 text-primary" />
                Send Notification to Course
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitToCourse} className="space-y-5">
                <CourseSelect 
                  courses={courses}
                  onChange={(id) => setSelectedCourseId(id)}
                  isLoading={isLoadingCourses}
                  label="Select Course"
                  placeholder="Choose a course"
                />
                
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
                    className="w-full"
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

export default InstructorNotifications;
