
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";

interface ResitExam {
  course_id: number;
  course_code: string;
  course_name: string;
  instructor_name: string;
  exam_date: string;
  location: string;
}


interface ResitExamsListProps {
  resitExams: ResitExam[];
  onClose: () => void;
}

const ResitExamsList: React.FC<ResitExamsListProps> = ({ resitExams, onClose }) => {
  return (
    <Card className="mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="font-semibold flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-teal-600" />
            All Resit Exams
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
          {resitExams && resitExams.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {resitExams.map((exam, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{exam.course_code} - {exam.course_name}</h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Instructor: {exam.instructor_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Date: {new Date(exam.exam_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No resit exams scheduled yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResitExamsList;
