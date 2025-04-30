
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

interface Grade {
  course_code: string;
  course_name: string;
  grade: number | null;
  letter_grade: string;
}

const StudentGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await studentAPI.getGrades();
        setGrades(data.grades);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const getGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case "AA":
      case "BA":
        return "text-green-600 font-semibold";
      case "BB":
      case "CB":
        return "text-green-500";
      case "CC":
      case "DC":
        return "text-yellow-600";
      case "DD":
        return "text-orange-500";
      case "FD":
      case "FF":
        return "text-red-600 font-semibold";
      case "DZ":
        return "text-gray-500";
      default:
        return "";
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
      <h1 className="text-3xl font-bold mb-6">My Grades</h1>

      <Card>
        <CardHeader>
          <CardTitle>Course Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Numeric Grade</TableHead>
                  <TableHead>Letter Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell>{grade.course_code}</TableCell>
                    <TableCell>{grade.course_name}</TableCell>
                    <TableCell>{grade.grade ?? "N/A"}</TableCell>
                    <TableCell className={getGradeColor(grade.letter_grade)}>
                      {grade.letter_grade}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No grades available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGrades;
