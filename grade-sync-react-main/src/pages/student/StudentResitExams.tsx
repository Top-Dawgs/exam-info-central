
import { useEffect, useState } from "react";
import { studentAPI } from "@/services/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ResitExam {
  course_code: string;
  course_name: string;
  exam_date: string;
  location: string | null;
  no_of_questions: number | null;
  allowed_tools: string | null;
  notes: string | null;
}

const StudentResitExams = () => {
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchResitExams = async () => {
      try {
        const data = await studentAPI.getResitExams();
        setResitExams(data.resitExams);
      } catch (error) {
        console.error("Error fetching resit exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResitExams();
  }, []);

  const handleDeclareResit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId) {
      toast.error("Please enter a course ID");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await studentAPI.declareResit(parseInt(courseId));
      toast.success("Successfully registered for the resit exam");
      
      // Refresh the list
      const data = await studentAPI.getResitExams();
      setResitExams(data.resitExams);
      
      // Clear the form
      setCourseId("");
    } catch (error) {
      console.error("Error declaring resit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resit Exams</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Declare for Resit Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeclareResit} className="space-y-4">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </div>
                ) : (
                  "Declare for Resit"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Registered Resit Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {resitExams.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resitExams.map((exam, index) => (
                    <TableRow key={index}>
                      <TableCell>{exam.course_code}</TableCell>
                      <TableCell>{exam.course_name}</TableCell>
                      <TableCell>
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{exam.location || "TBA"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  You are not registered for any resit exams.
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
