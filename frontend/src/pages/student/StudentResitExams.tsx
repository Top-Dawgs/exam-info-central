
import { useEffect, useState } from "react";
import { studentAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, List, Clock, MapPin, FileText, Info, Layers } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/components/CourseSelect";

interface ResitExam {
  course_id: number;
  course_code: string;
  course_name: string;
  exam_date: string;
  location: string | null;
  no_of_questions: number | null;
  allowed_tools: string | null;
  notes: string | null;
}

interface ResitCourse {
  course_id: number;
  course_code: string;
  course_name: string;
}

const StudentResitExams = () => {
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<ResitCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([]);


  useEffect(() => {
    const fetchResitExams = async () => {
      try {
        const data = await studentAPI.getResitExams();
        console.log("Resit exams data:", data);
        setResitExams(data.resitExams || []);
      } catch (error) {
        console.error("Error fetching resit exams:", error);
        toast.error("Failed to fetch resit exams. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchEligibleCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const data = await studentAPI.getEligibleResitCourses();
        console.log("Eligible courses:", data);
        setCourses(data.eligible_courses || []);
      } catch (error) {
        console.error("Error fetching eligible courses:", error);
        toast.error("Failed to fetch eligible courses. Please try again later.");
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchResitExams();
    fetchEligibleCourses();
  }, []);

  const handleDeclareResit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await studentAPI.declareResit(selectedCourseId);
      toast.success("Successfully registered for the resit exam");
      
      // Refresh the list
      const data = await studentAPI.getResitExams();
      setResitExams(data.resitExams || []);
      
      // Reset selection
      setSelectedCourseId(null);
    } catch (error: unknown) {
      console.error("Error declaring resit:", error);
      
      // Improved error handling
      if (error.response?.data?.error?.includes("No resit exam scheduled")) {
        toast.error("No resit exam available for this course yet");
      } else if (error.response?.data?.error?.includes("not eligible")) {
        toast.error("You are not eligible for a resit in this course");
      } else {
        toast.error("Failed to register for resit. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
  };

  const renderSkeletonCard = () => (
    <div className="animate-pulse space-y-4">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-40" />
    </div>
  );

  const renderSkeletonTable = () => (
    <div className="animate-pulse">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-900/20 dark:via-gray-900 dark:to-gray-900"></div>
      
      <div className="mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold flex items-center">
          <Calendar className="mr-3 h-8 w-8" />
          Resit Exams
        </h1>
        <p className="mt-2 text-indigo-100">Register and manage your resit examinations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-violet-600 dark:text-violet-400" />
              Register for Resit Exam
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingCourses ? (
              <div className="animate-pulse space-y-4">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : (
              <form onSubmit={handleDeclareResit} className="space-y-5">
  <div className="space-y-2">
    <label className="text-sm font-medium" htmlFor="course-select">
      Select Course
    </label>
    <Select 
      value={selectedCourseId?.toString() || ""} 
      onValueChange={(value) => setSelectedCourseId(Number(value))}
    >
      <SelectTrigger className="w-full bg-white dark:bg-gray-800">
        <SelectValue placeholder="Choose a course for resit" />
      </SelectTrigger>
      <SelectContent>
        {eligibleCourses.length > 0 ? (
          eligibleCourses.map((course) => (
            <SelectItem key={course.course_id} value={course.course_id.toString()}>
              {course.course_name} ({course.course_code})
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-courses" disabled>
            No eligible courses for resit.
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  </div>

  <Button 
    type="submit" 
    className="w-full h-11 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg" 
    disabled={isSubmitting || !selectedCourseId || eligibleCourses.length === 0}
  >
    {isSubmitting ? (
      <div className="flex items-center">
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        Submitting...
      </div>
    ) : (
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-2" />
        Register for Resit
      </div>
    )}
  </Button>
</form>

            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b">
            <CardTitle className="text-xl font-semibold flex items-center">
              <List className="h-5 w-5 mr-3 text-violet-600 dark:text-violet-400" />
              My Registered Resit Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              renderSkeletonTable()
            ) : resitExams.length > 0 ? (
              <div className="space-y-4">
                {resitExams.map((exam, index) => (
                  <Card key={index} className="border border-gray-200/70 dark:border-gray-700/70 overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="p-4 md:p-6 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 flex items-center">
                            <Layers className="h-4 w-4 mr-2 text-indigo-500" />
                            {exam.course_code}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">{exam.course_name}</p>
                        </div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700 px-3 py-1 h-auto text-xs">
                          Registered
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Exam Date</p>
                            <p className="text-sm font-medium">{new Date(exam.exam_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Exam Time</p>
                            <p className="text-sm font-medium">{new Date(exam.exam_date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                            <p className="text-sm font-medium">{exam.location || "TBA"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast(
                              <div className="space-y-2">
                                <div className="font-medium">{exam.course_code} - {exam.course_name}</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Questions</p>
                                    <p>{exam.no_of_questions || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Allowed Tools</p>
                                    <p>{exam.allowed_tools || 'Not specified'}</p>
                                  </div>
                                </div>
                                {exam.notes && (
                                  <div className="pt-2 mt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p>{exam.notes}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }}
                          className="flex items-center text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <FileText className="h-4 w-4 mr-1.5" />
                          View Exam Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-indigo-50 p-3 mb-4">
                  <Calendar className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">You are not registered for any resit exams.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use the form on the left to register for a resit exam.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentResitExams;
