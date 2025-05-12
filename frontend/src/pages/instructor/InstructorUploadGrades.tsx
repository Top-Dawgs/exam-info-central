import { useState, useEffect } from "react";
import { instructorAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Check, ChevronRight, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import CourseSelect, { Course } from "@/components/CourseSelect";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  { id: 1, title: "Select Course" },
  { id: 2, title: "Upload File" },
  { id: 3, title: "Confirmation" },
];

const InstructorUploadGrades = () => {
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadResult, setUploadResult] = useState<{ processed?: number; errors?: any[] } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await instructorAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const moveToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCourseId(null);
    setCurrentStep(1);
    setUploadResult(null);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!courseId) {
      toast.error("Please select a course");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await instructorAPI.uploadGradesFile(file, courseId);
      toast.success("Grades uploaded successfully");
      
      // Set upload result to display on confirmation step
      setUploadResult(response);
      
      // Move to confirmation step
      setCurrentStep(3);
    } catch (error) {
      console.error("Error uploading grades:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getSelectedCourse = () => {
    return courses.find(course => course.course_id === courseId);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div 
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              currentStep === step.id
                ? "bg-indigo-600 text-white" 
                : currentStep > step.id
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
            }`}
          >
            {currentStep > step.id ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="text-sm font-medium">{step.id}</span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mx-2">{step.title}</div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 w-10 sm:w-20 ${
              currentStep > step.id + 1
                ? "bg-green-500"
                : "bg-gray-200 dark:bg-gray-700"
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <CourseSelect 
              courses={courses}
              onChange={(id) => setCourseId(id)}
              isLoading={isLoading}
              label="Course"
              placeholder="Select a course"
            />

            <div className="flex justify-end">
              <Button 
                onClick={moveToNextStep}
                disabled={!courseId}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
              >
                Next Step
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">Selected Course</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {getSelectedCourse()?.course_code} - {getSelectedCourse()?.course_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="file" className="text-base font-medium">Upload Grades CSV File</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary transition-colors">
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3 mb-3">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="mb-1 font-medium text-gray-700 dark:text-gray-200">
                      {file ? file.name : "Click to upload CSV file"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CSV file with columns: student_id (or email), grade
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                type="button"
                variant="outline" 
                onClick={moveToPreviousStep}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !file} 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Grades
                  </div>
                )}
              </Button>
            </div>
          </form>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-100 dark:border-green-800/30 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-800/50 p-3">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-green-800 dark:text-green-300 mb-2">Upload Successful!</h3>
              <p className="text-green-600 dark:text-green-400">
                Grades have been successfully uploaded for {getSelectedCourse()?.course_code}
              </p>
              
              {uploadResult && (
                <div className="mt-6 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Processed Entries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{uploadResult.processed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Errors</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{uploadResult.errors?.length || 0}</p>
                    </div>
                  </div>
                  
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Error details:</p>
                      <div className="max-h-32 overflow-auto bg-white dark:bg-gray-800 rounded-lg p-3 text-xs font-mono">
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="mb-1 text-red-600 dark:text-red-400">
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6">
              <Button 
                onClick={resetForm}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
              >
                Upload More Grades
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderGuidelines = () => (
    <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
      <h3 className="text-lg font-semibold mb-3">CSV Format Guidelines</h3>
      <div className="text-sm">
        <p className="mb-3">Your CSV file should include these columns:</p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>
            <strong>student_id</strong> or <strong>email</strong> - Student ID or email address
          </li>
          <li>
            <strong>grade</strong> - Numeric grade (0-100) or "DZ" for non-attendance
          </li>
        </ul>
        <p className="font-semibold mb-2">Example:</p>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-md font-mono text-xs shadow-inner overflow-auto">
          <code>email,grade</code><br />
          <code>student1@example.com,85</code><br />
          <code>student2@example.com,DZ</code>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-blue-900/20 dark:via-gray-900 dark:to-gray-900"></div>
      
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold flex items-center">
          <Upload className="mr-3 h-8 w-8" />
          Upload Grades
        </h1>
        <p className="mt-2 text-blue-100">Upload and manage student grades for your courses</p>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b">
          <CardTitle className="flex items-center text-xl font-bold">
            <Upload className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
            Upload Grades File
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              {renderStepIndicator()}
              {renderStepContent()}
              {currentStep === 2 && renderGuidelines()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorUploadGrades;
