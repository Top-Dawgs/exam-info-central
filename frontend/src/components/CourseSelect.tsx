
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
}

interface CourseSelectProps {
  courses: Course[];
  onChange: (courseId: number) => void;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const CourseSelect = ({
  courses,
  onChange,
  label = "Select Course",
  placeholder = "Select a course",
  defaultValue,
  disabled = false,
  isLoading = false,
}: CourseSelectProps) => {
  const [value, setValue] = useState<string>(defaultValue || "");

  const handleValueChange = (val: string) => {
    setValue(val);
    onChange(parseInt(val));
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading courses..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.course_id} value={course.course_id.toString()}>
              {course.course_code} - {course.course_name}
            </SelectItem>
          ))}
          {courses.length === 0 && !isLoading && (
            <SelectItem value="no-courses" disabled>
              No courses available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CourseSelect;
