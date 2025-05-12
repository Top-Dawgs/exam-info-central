
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface Student {
  student_id: number;
  student_name: string;
}

interface ResitRegistration {
  course_id: number;
  course_code: string;
  course_name: string;
  student_count: number;
  students?: Student[];
}

interface ResitRegistrationsListProps {
  resitRegistrations: ResitRegistration[];
  onClose: () => void;
}

const ResitRegistrationsList: React.FC<ResitRegistrationsListProps> = ({ resitRegistrations, onClose }) => {
  return (
    <Card className="mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="font-semibold flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-emerald-600" />
            All Resit Registrations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          {resitRegistrations && resitRegistrations.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {resitRegistrations.map((reg, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{reg.course_code} - {reg.course_name}</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                      {reg.student_count} students
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Registered Students:</p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 pl-4 list-disc">
                      {reg.students && reg.students.length > 0 ? (
                        <>
                          {reg.students.slice(0, 5).map((student, j) => (
                            <li key={j}>{student.student_name}</li>
                          ))}
                          {reg.students.length > 5 && (
                            <li className="italic">And {reg.students.length - 5} more...</li>
                          )}
                        </>
                      ) : (
                        <li>No student details available</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No students have registered for resit exams yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResitRegistrationsList;
