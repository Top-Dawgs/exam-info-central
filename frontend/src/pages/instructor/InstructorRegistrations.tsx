
import { useState, useEffect } from "react";
import { instructorAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import CourseSelect, { Course } from "@/components/CourseSelect";
import { Badge } from "@/components/ui/badge";

interface Participant {
  email: string;
  grade: number | null;
  letter_grade: string;
  exam_date: string;
  course_code: string;
  course_name: string;
}

const InstructorRegistrations = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchParticipants = async () => {
      setIsLoadingParticipants(true);
      try {
        const data = await instructorAPI.getResitRegistrations(selectedCourseId);
        setParticipants(data.participants || []);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setIsLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [selectedCourseId]);

  const filteredParticipants = participants.filter(participant =>
    participant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLetterGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case 'AA': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'BA': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'BB': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CB': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CC': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DC': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DD': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'FD': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'FF': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'DZ': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Resit Registrations</h1>

      <Card className="card-hover mb-8">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
          <CardTitle className="flex items-center text-xl font-bold">
            <Search className="h-5 w-5 mr-3 text-primary" />
            View Registrations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <CourseSelect 
              courses={courses}
              onChange={(id) => setSelectedCourseId(id)}
              isLoading={isLoadingCourses}
              label="Select Course"
              placeholder="Choose a course to view registrations"
            />

            {selectedCourseId && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by student email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md mb-4 bg-gradient-to-r from-gray-50 to-white"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            )}

            {isLoadingParticipants ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : selectedCourseId ? (
              filteredParticipants.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Letter Grade</TableHead>
                        <TableHead>Exam Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.map((participant, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{participant.email}</TableCell>
                          <TableCell>{participant.grade ?? "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={getLetterGradeColor(participant.letter_grade)}>
                              {participant.letter_grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(participant.exam_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">No registered students found for this course.</p>
                </div>
              )
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorRegistrations;
