
import api from "./apiConfig";
import { studentAPI } from "./studentApi";
import { instructorAPI } from "./instructorApi";
import { facultyAPI } from "./facultyApi";

export const dashboardAPI = {
  getDashboard: async () => {
    try {
      // First try the normal dashboard endpoint
      const response = await api.get("/dashboard");
      
      // If this is a student, we need to ensure total_courses matches grades
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (user && user.role === "student") {
        // Fetch grades to ensure accurate course count
        const gradesData = await studentAPI.getGrades();
        if (gradesData && gradesData.grades) {
          response.data.total_courses = gradesData.grades.length;
        }
      }
      
      // For instructors, ensure courses are properly loaded
      if (user && user.role === "instructor") {
        const coursesData = await instructorAPI.getMyCourses();
        if (coursesData && coursesData.courses) {
          response.data.instructor_courses = coursesData.courses;
        }
      }
      
      // For faculty, ensure resit data is properly loaded
      if (user && user.role === "faculty_secretary") {
        try {
          const resitData = await facultyAPI.getAllResitRegistrations();
          if (resitData && resitData.registrations) {
            response.data.total_resit_registrations = resitData.registrations.length;
          }
          
          const examData = await facultyAPI.getAllResitExams();
          if (examData && examData.resitExams) {
            response.data.total_resit_exams = examData.resitExams.length;
          }
        } catch (error) {
          console.error("Error loading faculty data:", error);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Error loading dashboard:", error);
      
      // Return basic structure to prevent UI errors
      return {
        role: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).role : "",
        total_courses: 0,
        registered_resits: 0,
        gpa: "0.00",
        courses: [],
        instructor_courses: [],
        total_resit_registrations: 0,
        total_resit_exams: 0
      };
    }
  },
};
