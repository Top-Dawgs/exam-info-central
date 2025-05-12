
import React, { useState } from "react";
import { TrendingUp, BookOpen, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import StatCard from "./StatCard";
import ResitExamsList from "./ResitExamsList";
import ResitRegistrationsList from "./ResitRegistrationsList";

interface FacultyDashboardProps {
  dashboardData: {
    total_resit_registrations?: number;
    total_resit_exams?: number;
  };
  resitExams: Array<{
    course_id: number;
    course_code: string;
    course_name: string;
    instructor_name: string;
    exam_date: string;
  }>;
  resitRegistrations: Array<{
    course_id: number;
    course_code: string;
    course_name: string;
    student_count: number;
    students?: Array<{
      student_id: number;
      student_name: string;
    }>;
  }>;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ dashboardData, resitExams, resitRegistrations }) => {
  const [showResitExams, setShowResitExams] = useState(false);
  const [showResitRegistrations, setShowResitRegistrations] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-xl mb-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        <h2 className="text-3xl font-bold flex items-center">
          <TrendingUp className="mr-3 h-8 w-8" />
          Faculty Secretary Dashboard
        </h2>
        <p className="mt-2 text-emerald-100">Manage resit exams and registrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div>
              <StatCard 
                title="Total Resit Registrations" 
                value={dashboardData.total_resit_registrations || 0}
                icon={<BookOpen className="h-5 w-5 text-emerald-600" />} 
                index={0}
                onClick={() => setShowResitRegistrations(true)}
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Resit Registrations</h4>
                <p className="text-xs text-muted-foreground">
                  Click to view all students registered for resit exams
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <div>
              <StatCard 
                title="Total Resit Exams" 
                value={dashboardData.total_resit_exams || 0} 
                icon={<CalendarClock className="h-5 w-5 text-teal-600" />} 
                index={1}
                onClick={() => setShowResitExams(true)}
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Resit Exams</h4>
                <p className="text-xs text-muted-foreground">
                  Click to view all scheduled resit exams
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {showResitExams && (
        <ResitExamsList 
          resitExams={resitExams} 
          onClose={() => setShowResitExams(false)} 
        />
      )}

      {showResitRegistrations && (
        <ResitRegistrationsList 
          resitRegistrations={resitRegistrations} 
          onClose={() => setShowResitRegistrations(false)}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
